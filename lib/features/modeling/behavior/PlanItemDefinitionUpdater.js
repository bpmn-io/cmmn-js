'use strict';

var inherits = require('inherits');

var forEach = require('min-dash').forEach,
    unionBy = require('min-dash').unionBy,
    filter = require('min-dash').filter;

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor').default;

var ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    getDefinition = ModelUtil.getDefinition,
    getBusinessObject = ModelUtil.getBusinessObject;

var ModelingUtil = require('../util/ModelingUtil'),
    getParents = ModelingUtil.getParents,
    getParent = ModelingUtil.getParent,
    getCase = ModelingUtil.getCase,
    isLabel = ModelingUtil.isLabel;

var PlanItemDefinitionUtil = require('../util/PlanItemDefinitionUtil'),
    getAllDiscretionaryItems = PlanItemDefinitionUtil.getAllDiscretionaryItems,
    getDirectItemCapables = PlanItemDefinitionUtil.getDirectItemCapables,
    isItemCapable = PlanItemDefinitionUtil.isItemCapable,
    isHumanTask = PlanItemDefinitionUtil.isHumanTask;

var LOW_PRIORITY = 400;

/**
 * A handler responsible for updating the parent relation of a plan item definition
 * to the underlying CMMN 1.1 XML once changes on the diagram happen.
 */
function PlanItemDefinitionUpdater(
    eventBus,
    modeling,
    cmmnReplace,
    itemRegistry
) {

  this._modeling = modeling;
  this._cmmnReplace = cmmnReplace;
  this._itemRegistry = itemRegistry;

  var self = this;

  CommandInterceptor.call(this, eventBus);

  var containment = 'planItemDefinitions';


  // CREATION //////////////////////////////////////////////////////////

  this.postExecuted('shape.create', function(context) {

    var shape = context.shape;

    if (!isItemCapable(shape)) {
      return;
    }

    var item = getBusinessObject(shape),
        definition = getDefinition(item),
        parent = getParentStage(item);

    if (!getParent(definition)) {
      modeling.updateSemanticParent(definition, parent, containment);
    }

  }, true);


  this.postExecuted('shape.replace', function(context) {

    var newShape = context.newShape;

    if (!isItemCapable(newShape)) {
      return;
    }

    self.updatePlanItemDefinitions([ newShape ]);

  }, true);


  // DELETION //////////////////////////////////////////////////////////

  this.postExecuted('shape.delete', function(context) {

    var shape = context.shape,
        definition,
        update = {};

    if (!isItemCapable(shape) || isLabel(shape)) {
      return;
    }

    definition = getDefinition(shape);
    update[definition.id] = definition;
    self.deletePlanItemDefinitions(update);

  }, true);


  this.preExecuted('shape.delete', function(context) {

    var shape = context.shape,
        definition = getDefinition(shape);

    if (!isHumanTask(definition) || definition.$parent) {
      return;
    }

    // get remaining discretionary items
    context.discretionaryItems = context.discretionaryItems || getAllDiscretionaryItems(definition);

  }, true);


  this.postExecuted('shape.delete', LOW_PRIORITY, function(context) {

    var discretionaryItems = context.discretionaryItems,
        shapes = [];

    forEach(discretionaryItems, function(item) {
      var shapeItem = itemRegistry.getShape(item.id);

      if (shapeItem) {
        shapes.push(shapeItem);
      }

    });

    if (shapes && shapes.length) {
      self.updatePlanItemDefinitions(shapes);
    }

  }, true);


  // MOVING //////////////////////////////////////////////////////////////

  this.preExecuted('elements.move', function(context) {

    var allShapes = context.closure.allShapes,
        newParent = context.newParent,
        hints = context.hints,
        oldParent = hints && hints.primaryShape && hints.primaryShape.parent,
        replacements = {},
        shapes, // array of moved item capables
        movedItemCapables = {}, // grouped by definition
        newTargetCase;

    if (!newParent || oldParent === newParent) {
      return;
    }

    newTargetCase = getCase(newParent);

    shapes = filter(allShapes, function(shape) {

      if (isItemCapable(shape) && !isLabel(shape) && getCase(shape) !== newTargetCase) {

        var definition = getDefinition(shape);
        movedItemCapables[definition.id] = movedItemCapables[definition.id] || [];
        movedItemCapables[definition.id].push(shape);

        return true;
      }

      return false;
    });


    forEach(shapes, function(shape) {

      var definition = getDefinition(shape),
          referencedBy,
          movedShapes,
          newDefinition;

      if (replacements[definition.id]) {
        newDefinition = replacements[definition.id];
      }

      else {

        referencedBy = itemRegistry.getReferences(definition.id);
        movedShapes = movedItemCapables[definition.id];

        if (referencedBy.length > movedShapes.length) {
          newDefinition = replacements[definition.id] = cmmnReplace.replacePlanItemDefinition(definition);
        }

      }

      if (newDefinition && newDefinition !== definition) {
        modeling.updateProperties(shape, {
          definitionRef: newDefinition
        });
      }

    });

    // remember replacement of definitions
    context.definitionReplacements = replacements;

  }, true);


  this.postExecuted('elements.move', LOW_PRIORITY, function(context) {

    var shapes = context.shapes,
        newParent = context.newParent,
        oldParent = (context.hints && context.hints.oldParent);

    if (!newParent || oldParent === newParent) {
      return;
    }

    shapes = filter(shapes, function(shape) {
      return isItemCapable(shape) && !isLabel(shape);
    });

    if (shapes && shapes.length) {
      self.updatePlanItemDefinitions(shapes);
    }

  }, true);


  // CONNECTIONS //////////////////////////////////////////////////////////////

  this.postExecuted([
    'connection.create',
    'connection.delete',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], LOW_PRIORITY, function(context) {

    var connection = context.connection,
        source = context.newSource || context.source || connection.source,
        target = context.newTarget || context.target || connection.target,
        shapes = [];

    if (!isDiscretionaryConnection(connection, source, target)) {
      return;
    }

    if (connection.target) {
      shapes.push(connection.target);
    }

    if (!connection.target && context.target) {
      shapes.push(context.target);
    }

    if (context.oldTarget) {
      shapes.push(context.oldTarget);
    }

    if (shapes && shapes.length) {
      self.updatePlanItemDefinitions(shapes);
    }

  }, true);


  // API ////////////////////////////////////////////////////////

  /**
   * Deletes the given plan item definitions.
   *
   * A plan item definition is deleted when it is not
   * referenced by a plan item or a discretionary item.
   *
   * @param {Array<ModdleElement>} definitions to delete
   */
  this.deletePlanItemDefinitions = function(definitions) {
    var references;

    forEach(definitions, function(definition) {
      references = itemRegistry.getReferences(definition);
      if (!references.length) {
        modeling.updateSemanticParent(definition, null, containment);
      }
    });
  };



  /**
   * Rearrange the plan item definitions of the given shapes.
   *
   * @param {Array<djs.model.Base>} shapes
   */
  this.updatePlanItemDefinitions = function(shapes) {

    handleEachItemCapable(shapes, function(shape) {

      var item = getBusinessObject(shape),
          definition = getDefinition(item),
          references = itemRegistry.getReferences(definition),
          sharedParent = getSharedParent(references);

      if (!sharedParent) {
        sharedParent = getCasePlanModel(item);
      }

      if (sharedParent && sharedParent !== definition.$parent) {
        modeling.updateSemanticParent(definition, sharedParent, containment);
      }

      var itemCapables = getDirectItemCapables(definition),
          children = [];

      if (is(definition, 'cmmn:PlanFragment') && shape.children && shape.children.length) {
        forEach(shape.children, function(child) {
          var bo = getBusinessObject(child);
          if (isItemCapable(bo) && !isLabel(bo) && itemCapables.indexOf(bo) === -1) {
            children.push(bo);
          }
        });

      }

      return unionBy('id', itemCapables, children);

    });

  };


  // UTILITIES ///////////////////////////////////////////////////////////////


  function handleEachItemCapable(elements, fn) {

    var handledElements = {};

    function handled(element) {
      handledElements[element.id] = element;
    }

    function isHandled(element) {
      return !!handledElements[element.id];
    }

    function eachElement(elements, isRoot) {
      forEach(elements, function(element) {

        if (!isHandled(element)) {
          handled(element);

          element = itemRegistry.getShape(element.id) || element;
          var children = fn(element);

          if (children && children.length) {
            eachElement(children);
          }
        }

        if (isRoot) {
          handledElements = {};
        }

      });
    }

    eachElement(elements, true);
  }

}

PlanItemDefinitionUpdater.$inject = [
  'eventBus',
  'modeling',
  'cmmnReplace',
  'itemRegistry'
];

inherits(PlanItemDefinitionUpdater, CommandInterceptor);

module.exports = PlanItemDefinitionUpdater;


/**
 * Utilities
 */

function getSharedParent(elements) {

  var sharedParent,
      first;

  if (elements.length) {

    first = elements.splice(0, 1)[0];

    if (!elements.length) {
      sharedParent = getParentStage(first);
    }
    else {
      var candidates = getParentStages(first);
      forEach(elements, function(e) {
        candidates = intersection(candidates, getParentStages(e));
      });

      sharedParent = candidates[0];
    }

  }

  return sharedParent;

}


function getParentStage(element) {
  element = getBusinessObject(element);
  return getParent(element, 'cmmn:Stage');
}


function getParentStages(element) {
  element = getBusinessObject(element);
  return getParents(element, 'cmmn:Stage');
}


function getCasePlanModel(element) {
  var _case = getParent(element, 'cmmn:Case');
  return _case && _case.casePlanModel;
}


function isDiscretionaryConnection(connection, source, target) {
  return !connection.businessObject.cmmnElementRef;
}


// helpers /////////////////

function intersection(a, b) {

  return filter(a, function(e) {
    return b.indexOf(e) !== -1;
  });
}