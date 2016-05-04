'use strict';

var inherits = require('inherits');

var forEach = require('lodash/collection/forEach'),
    groupBy = require('lodash/collection/groupBy'),
    isArray = require('lodash/lang/isArray'),
    reduce = require('lodash/object/transform'),
    intersection = require('lodash/array/intersection'),
    filter = require('lodash/collection/filter');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var ModelUtil = require('../../../util/ModelUtil'),
    getDefinition = ModelUtil.getDefinition,
    getBusinessObject = ModelUtil.getBusinessObject;

var ModelingUtil = require('../util/ModelingUtil'),
    getParents = ModelingUtil.getParents,
    getParent = ModelingUtil.getParent,
    isSameCase = ModelingUtil.isSameCase;

var PlanItemDefinitionUtil = require('../util/PlanItemDefinitionUtil'),
    getAllDiscretionaryItems = PlanItemDefinitionUtil.getAllDiscretionaryItems,
    getDirectItemCapables = PlanItemDefinitionUtil.getDirectItemCapables,
    isItemCapable = PlanItemDefinitionUtil.isItemCapable,
    isHumanTask = PlanItemDefinitionUtil.isHumanTask;

var VERY_LOW_PRIORITY = 400,
    LOW_PRIORITY = 500,
    HIGH_PRIORITY = 5000;

/**
 * A handler responsible for updating the parent relation of a plan item definition
 * to the underlying CMMN 1.1 XML once changes on the diagram happen.
 */
function PlanItemDefinitionUpdater(
  eventBus,
  elementRegistry,
  cmmnFactory,
  modeling,
  cmmnReplace
) {

  this._cmmnFactory = cmmnFactory;
  this._modeling = modeling;
  this._elementRegistry = elementRegistry;

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
        parent = getParent(item, 'cmmn:Stage');

    if (!getParent(definition)) {
      modeling.updateSemanticParent(definition, parent, containment);
    }

  }, true);


  // DELETION //////////////////////////////////////////////////////////

  // NOTE: There is also a seperate moveContext in order to
  // avoid a conflict when during moving an element also a deletion
  // event is triggered.
  var deletionContext;


  /**
   * Initialize the deletion context.
   */
  function initDeletionContext() {
    deletionContext = deletionContext || new UpdateContext();
    deletionContext.enter();

    return deletionContext;
  }


  /**
   * Returns the deletion context
   */
  function getDeletionContext() {
    if (!deletionContext) {
      throw new Error('out of bounds release');
    }

    return deletionContext;
  }


  /**
   * Releases the deletion context, when the
   * update of plan item definitions is triggered.
   */
  function releaseDeletionContext() {

    if (!deletionContext) {
      throw new Error('out of bounds release');
    }

    var triggerUpdate = deletionContext.leave();

    if (triggerUpdate) {
      self.deletePlanItemDefinitions(deletionContext.definitions);

      deletionContext = null;
    }

    return triggerUpdate;
  }

  // listen to several events to group deletion of plan item definitions

  var deletionEvents = [
    'elements.delete',
    'shape.delete'
  ];

  this.preExecute(deletionEvents, HIGH_PRIORITY, function(event) {
    initDeletionContext();
  });

  this.postExecuted(deletionEvents, LOW_PRIORITY, function(event) {
    releaseDeletionContext();
  });

  this.preExecute('shape.delete', function(context) {

    var shape = context.shape;

    if (!isItemCapable(shape)) {
      return;
    }

    // add shape to delete into the deletion context
    var deletionContext = getDeletionContext();
    deletionContext.add(shape);

  }, true);

  // Deletion API ////////////////////////////////////////////////////////

  /**
   * Deletes the given plan item definitions.
   *
   * A plan item definition is deleted when it is not
   * referenced by a plan item or a discretionary item.
   *
   * @param {Array<ModdleElement>} definitions to delete
   */
  this.deletePlanItemDefinitions = function(definitions) {
    var referencingItems = getReferencingItems(definitions);

    forEach(definitions, function(definition) {
      if (!referencingItems[definition.id]) {
        modeling.updateSemanticParent(definition, null, containment);
      }
    });
  };


  // MOVING //////////////////////////////////////////////////////////////

  this.postExecuted([
    'connection.create',
    'connection.delete',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], VERY_LOW_PRIORITY, function(context) {

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

    if (context.target) {
      shapes.push(context.target);
    }

    if (context.oldTarget) {
      shapes.push(context.oldTarget);
    }

    if (shapes && shapes.length) {
      self.updatePlanItemDefinitionsSemanticParent(shapes);
    }

  }, true);


  this.preExecuted('shape.delete', function(context) {

    var definition = getDefinition(context.shape);

    if (!isHumanTask(definition)) {
      return;
    }

    // get remaining discretionary items
    context.discretionaryItems = context.discretionaryItems || getAllDiscretionaryItems(definition);

  }, true);


  this.postExecuted('shape.delete', VERY_LOW_PRIORITY, function(context) {

    var discretionaryItems = context.discretionaryItems,
        shapes = [];

    forEach(discretionaryItems, function(item) {
      var shapeItem = elementRegistry.get(item.id);

      if (shapeItem) {
        shapes.push(shapeItem);
      }

    });

    if (shapes && shapes.length) {
      self.updatePlanItemDefinitionsSemanticParent(shapes);
    }

  }, true);



  this.postExecuted('elements.move', VERY_LOW_PRIORITY, function(context) {

    var shapes = context.shapes,
        allShapes = context.closure.allShapes,
        newParent = context.newParent,
        oldParent = context.hints && context.hints.oldParent;

    if (oldParent === newParent) {
      return;
    }

    shapes = filter(shapes, function(shape) {
      return isItemCapable(shape);
    });


    if (shapes && shapes.length) {
      allShapes = filter(allShapes, function(shape) {
        return isItemCapable(shape);
      });
      self.updatePlanItemDefinitionsSemanticParent(shapes, allShapes);
    }

  }, true);


  this.updatePlanItemDefinitionsSemanticParent = function(topLevelShapes, allShapes) {

    var definitions = unwrapDefinitions(allShapes || topLevelShapes),
        references = getReferencingItems(definitions),
        replacements = {};

    allShapes = groupByDefinition(allShapes || {});

    /**
     * Returns true if the given element is replaced
     */ 
    function isReplaced(definition) {
      return !!replacements[definition.id];
    }

    /**
     * Set the given old definition as replaced
     * with the given new definition.
     */
    function replace(oldDefinition, newDefinition) {
      replacements[oldDefinition.id] = newDefinition;
    }

    /**
     * Returns the replacement of the given definition.
     * If the no replacement is available the given definition
     * itself is returned.
     */
    function getReplacement(definition) {
      return replacements[definition.id] || definition;
    }

    /**
     * Adds the given shape to list of references for its definition.
     */
    function addReference(shape) {
      var definition = getDefinition(shape);
      references[definition.id] = references[definition.id] || [];
      references[definition.id].push(shape);
    }

    /**
     * Removes the given shape as a reference for its definition.
     */
    function removeReference(shape) {
      var definition = getDefinition(shape);
      var referencingItems = getReferences(definition) || [];
      var idx = referencingItems.indexOf(shape);
      if (idx > -1) {
        referencingItems.splice(idx, 1);
      }
    }

    /**
     * Returns the references of the given definition.
     */
    function getReferences(definition) {
      return references[definition.id];
    }

    /**
     * Returns true if the definition should be replaced.
     */
    function shouldReplace(definition) {
      var referencesLength = (references[definition.id] || []).length,
          allShapesLength = (allShapes[definition.id] || []).length;
      return referencesLength > allShapesLength;
    }


    handleEachItemCapable(topLevelShapes, function(shape) {

      var definition = getDefinition(shape),
          item = getBusinessObject(shape),
          referencingItems,
          commonParent;

      if (!definition) {
        throw new Error('no definition for ', item);
      }

      if (!isReplaced(definition) && !isSameCase(definition, item)) {

        if (shouldReplace(definition)) {

          // a definition must be replaced, when
          // 1) the definition is not replaced replacement happens when the definition is not already 
          // replaced and if a 'movement' to another case happend.
          // furthermore the number of references 

          var newDefinition = cmmnReplace.replacePlanItemDefinition(definition);
          replace(definition, newDefinition);

        }
       
      }

      definition = getReplacement(definition);
      if (getDefinition(item) !== definition) {
        removeReference(shape);
        modeling.updateProperties(shape, {
          definitionRef: definition
        });
        addReference(shape);
      }

      referencingItems = getReferences(definition);
      if (!referencingItems) {
        var query = unwrapDefinitions([ shape ]);
        referencingItems = references[definition.id] = getReferencingItems(query)[definition.id] || [];
      }

      if (referencingItems.indexOf(shape) === -1) {
        addReference(shape);
      }

      commonParent = getCommonParentStage(unwrapItems(referencingItems));

      if (!commonParent) {
        // If there are no referencing items it is possible that
        // the element is not drawn on the canvas. Then the most
        // upper stage element (casePlanModel) is fetched and used
        // as the parent.
        commonParent = getCasePlanModel(item);
      }

      // (3) Update the parent of the plan item definition.
      if (commonParent && commonParent !== definition.$parent) {
        modeling.updateSemanticParent(definition, commonParent, containment);
      }

      // (4) Get direct children (plan item and discretionary items)
      // event if the containment of the plan item definition did not change.
      return getDirectItemCapables(definition);
    });

  };


  // UTILITIES ///////////////////////////////////////////////////////////////

  /**
   * Returns a list of items referencing this definition
   * for each given definition.
   *
   * @param {Array<ModdleElement>} definitions
   *
   * @return {Object} items referencing
   *         the given definitions
   *
   */
  function getReferencingItems(definitions) {

    var items = {},
        elementRegistry = self._elementRegistry;

    elementRegistry.filter(function(element) {
      var definition = getDefinition(element);

      if (definition && definitions[definition.id]) {
        items[definition.id] = items[definition.id] || [];
        items[definition.id].push(element);
      }

    });

    return items;
  }


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

          element = elementRegistry.get(element.id) || element;
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


  function isDiscretionaryConnection(connection, source, target) {
    return !connection.businessObject.cmmnElementRef;
  }

}

PlanItemDefinitionUpdater.$inject = [
  'eventBus',
  'elementRegistry',
  'cmmnFactory',
  'modeling',
  'cmmnReplace'
];

inherits(PlanItemDefinitionUpdater, CommandInterceptor);

module.exports = PlanItemDefinitionUpdater;

/**
 * Utilities
 */


function groupByDefinition(shapes) {
  return groupBy(shapes, function(shape) {
    var definition = getDefinition(shape);
    return definition && definition.id;
  });
}

/**
 * Returns a list of plan item or discretionary items.
 *
 * @param {djs.model.Base} shapes
 *
 * @return {Array<ModdleElement>} the unwrapped items
 */
function unwrapItems(shapes) {
  return reduce(shapes, function(result, shape) {
    if (isItemCapable(shape)) {
      result.push(getBusinessObject(shape));
    }
    return result;
  }, []);
}

function unwrapDefinitions(shapes) {
  return reduce(shapes, function(result, shape) {
    var definition = getDefinition(shape);
    result[definition.id] = definition;
    return result;
  }, {});
}

/**
 * Returns all common parent stages for given elements.
 *
 * @param {Array<ModdleElement>} elements
 *
 * @return {Array<ModdleElement>} the common parent elements
 */
function getCommonParentStages(elements) {

  elements = toArray(elements);

  var parents = getParentStages(elements[0]);

  if (elements.length > 1) {
    forEach(elements, function(element) {
      parents = intersection(parents, getParentStages(element));
    });
  }

  return parents || [];
}


/**
 * Returns all parent stages of the given element.
 *
 * @param {ModdleElement} element
 *
 * @return {Array<ModdleElement>} the parent stages
 */
function getParentStages(element) {
  return getParents(element, 'cmmn:Stage');
}


/**
 * Returns the common parent stage for given elements.
 *
 * @param {Array<ModdleElement>} elements
 *
 * @return {ModdleElement} the common parent element
 */
function getCommonParentStage(elements) {

  elements = toArray(elements);

  var parent;

  if (elements.length === 1) {
    parent = getParentStage(elements[0]);
  }
  else {
    var parents = getCommonParentStages(elements);
    parent = parents[0];
  }

  return parent;
}


/**
 * Returns the parent stage of the given element.
 *
 * @param {ModdleElement} element
 *
 * @return {ModdleElement} the parent stage
 */
function getParentStage(element) {
  return getParent(element, 'cmmn:Stage');
}


function getCasePlanModel(element) {
  var _case = getParent(element, 'cmmn:Case');
  return _case.casePlanModel;
}


function toArray(elements) {
  if (!elements) {
    return [];
  }
  return isArray(elements) ? elements : [ elements ];
}


function UpdateContext() {

  this.definitions = {};

  this.counter = 0;

  this.add = function(element) {
    var definition = getDefinition(element) || element;
    this.definitions[definition.id] = definition;
  };

  this.enter = function() {
    this.counter++;
  };

  this.leave = function() {
    this.counter--;

    return !this.counter;
  };

}
