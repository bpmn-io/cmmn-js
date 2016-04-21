'use strict';

var inherits = require('inherits');

var forEach = require('lodash/collection/forEach'),
    groupBy = require('lodash/collection/groupBy'),
    isArray = require('lodash/lang/isArray');

var reduce = require('lodash/object/transform');
var intersection = require('lodash/array/intersection');

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
    isPlanningTableCapable = PlanItemDefinitionUtil.isPlanningTableCapable;

var isDiscretionaryConnection = require('../util/ConnectionUtil').isDiscretionaryConnection;

var LOW_PRIORITY = 500,
    HIGH_PRIORITY = 5000;

/**
 * A handler responsible for updating the parent relation of a plan item definition
 * to the underlying CMMN 1.1 XML once changes on the diagram happen.
 */
function PlanItemDefinitionUpdater(eventBus, elementRegistry, cmmnFactory, modeling) {
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

    modeling.updateSemanticParent(definition, parent, containment);

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

  // NOTE: There is also a seperate deletionContext in order to
  // avoid a conflict when during moving an element also a deletion
  // event is triggered.
  var moveContext;


  /**
   * Initialize the move context.
   */
  function initMoveContext() {
    moveContext = moveContext || new UpdateContext();
    moveContext.enter();

    return moveContext;
  }


  /**
   * Returns the move context
   */
  function getMoveContext() {
    if (!moveContext) {
      throw new Error('out of bounds release');
    }

    return moveContext;
  }


  /**
   * Releases the move context, when the
   * update of plan item definitions is triggered.
   */
  function releaseMoveContext(context) {

    if (!moveContext) {
      throw new Error('out of bounds release');
    }

    var triggerUpdate = moveContext.leave();

    if (triggerUpdate) {
      self.movePlanItemDefinitions(moveContext.definitions, moveContext.items, context);

      moveContext = null;
    }

    return triggerUpdate;
  }


  // listen to several events to group rearrangement of plan item definitions

  var moveEvents = [
    'elements.move',
    'shape.move',
    'connection.create',
    'connection.delete',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ];

  this.preExecute(moveEvents, HIGH_PRIORITY, function(context) {
    initMoveContext();
  }, true);

  this.postExecuted(moveEvents, LOW_PRIORITY, function(context) {
    releaseMoveContext(context);
  }, true);


  this.preExecute([
    'connection.create',
    'connection.delete',
    'connection.reconnectEnd',
    'connection.reconnectStart',
    'shape.move'
  ], function(context) {

    var shape = context.shape,
        connection = context.connection;

    var shapes = [];

    if (shape) {

      if (!isItemCapable(shape)) {
        return;
      }

      shapes.push(shape);
    }
    else {

      var source = context.newSource || context.source || connection.source;
      var target = context.newTarget || context.target || connection.target;

      if (!isDiscretionaryConnection(connection, source, target)) {
        return;
      }

      if (connection.target) {
        shapes.push(connection.target);
      }

      if (context.target) {
        shapes.push(context.target);
      }

      if (context.newTarget) {
        shapes.push(context.newTarget);
      }

    }

    var moveContext = getMoveContext();
    var definitions = moveContext.definitions;

    function handleEachDiscretionaryItem(elements) {
      forEach(elements, function(element) {

        var definition = getDefinition(element);
        if (!definitions[definition.id]) {
          definitions[definition.id] = definition;

          if (isPlanningTableCapable(definition)) {
            var children = getAllDiscretionaryItems(definition);

            if (children && children.length) {
              handleEachDiscretionaryItem(children);
            }
          }
        }
      });
    }

    forEach(shapes, function(shape) {
      moveContext.add(shape);
      if (isPlanningTableCapable(getDefinition(shape))) {
        handleEachDiscretionaryItem(getAllDiscretionaryItems(shape));
      }
    });

  }, true);

  // Move API ///////////////////////////////////////////////////////////////

  /**
   * Move the plan item definitions to a new parent, so that the
   * plan item definition can be referenced by plan items or discretionary
   * items.
   *
   * @param {Object<ModdleElement>} definitions affected definition to rearrange
   * @param {Array<ModdleElement>} allMovedItems all moved items
   * @param {Object} context the origin context given by the exected command
   *
   */
  this.movePlanItemDefinitions = function(definitions, allMovedItems, context) {

    var topLevelItems,
        shapes,
        sameCase = true;

    if (!context.connection) {

      var newParent = context.newParent,
          oldParent = (context.hints && context.hints.oldParent) || context.oldParent;

      // (1) parent did not change nothing to do or
      // no item capable element has been moved
      if (oldParent === newParent || !allMovedItems.length) {
        return;
      }

      shapes = context.shapes || context.shape;

      if (oldParent && newParent) {
        sameCase = isSameCase(oldParent, newParent);
      }

    }
    else {
      var connection = context.connection;

      shapes = [];
      if (connection.target) {
        shapes.push(connection.target);
      }

      if (context.target) {
        shapes.push(context.target);
      }

      if (context.oldTarget) {
        shapes.push(context.oldTarget);
      }
    }

    // (2) retrieve all top level items
    // these are the elements that have been selected and moved
    shapes = toArray(shapes);
    topLevelItems = unwrapItems(shapes);

    // (3) group all moved items by the plan item defition id
    allMovedItems = groupBy(allMovedItems, function(item) {
      return getDefinition(item).id;
    });

    // (4) get all items referencing the given definitions
    // returns an map: definition id -> items
    var references = getReferencingItems(definitions);

    // (5) trigger update
    handleElementsMovement(topLevelItems, {
      references: references,
      sameCase: sameCase,
      allMovedItems: allMovedItems
    }, true);

  };

  /**
   * Iterates over the given list of elements and triggers the rearrangement
   * of the referenced plan item definition. If this plan item definition
   * has some children, then the plan item definitions referenced by the
   * children are also rearranged.
   *
   * @param {Array<ModdleElement>} elements moved top level elements
   * @param {Object} context
   * @param {Object} context.references all referencing items grouped
   *                                                 by plan item definition
   * @param {Boolean} context.sameCase indicates whether the movement happend into another
   *                                             case
   * @param {Object} context.allMovedItems all moved items grouped
   *                                                 by plan item definition
   */
  function handleElementsMovement(elements, context) {

    var handledElements = {};

    function handled(element) {
      handledElements[element.id] = element;
    }

    function isHandled(element) {
      return !!handledElements[element.id];
    }

    function handleEachElement(elements, isRoot) {
      forEach(elements, function(element) {

        if (!isHandled(element)) {
          handled(element);

          var children = movePlanItemDefinitionOfElement(element, context);

          if (children && children.length) {
            handleEachElement(children);
          }
        }

        if (isRoot) {
          handledElements = {};
        }

      });
    }

    handleEachElement(elements, true);
  }

  /**
   * Move the plan item definition of the given element to
   * correct stage, so that the element (and other referencing
   * items) are able to reference these items.
   *
   * @param {ModdleElement} element moved top level element
   * @param {Object} context
   * @param {Object} context.references all referencing items grouped
   *                                                 by plan item definition
   * @param {Boolean} context.sameCase indicates whether the movement happend into another
   *                                             case
   * @param {Object} context.allMovedItems all moved items grouped
   *                                                 by plan item definition
   */
  function movePlanItemDefinitionOfElement(element, context) {

    // (1) get the definition
    var definition = getDefinition(element);

    if (!definition) {
      throw new Error('no definition for ', getBusinessObject(element));
    }

    var references = context.references;
    var referecingItems = references[definition.id];
    var movedItems = context.allMovedItems[definition.id];

    if (!context.sameCase && !movedItems) {
      return;
    }

    if (!context.sameCase) {

      if (referecingItems.length > movedItems.length) {

        // (2) Create new plan item definition
        // * if the element is moved to another case and
        // * if some items referencing the same plan item
        //   definition are still left in the former case.

        var idx = referecingItems.indexOf(element);
        referecingItems.splice(idx, 1);

        var type = definition.$type;

        // TODO: copy in a proper way the properties of
        // the already existing plan item definition
        definition = self._cmmnFactory.create(type, {
          name: definition.name
        });

        var shape = self._elementRegistry.get(element.id) || element;
        modeling.updateProperties(shape, {
          definitionRef: definition
        });

        referecingItems = [ element ];
      }
    }

    var commonParent;
    if (referecingItems) {
      commonParent = getCommonParentStage(referecingItems);
    }
    else {
      // If there are no referencing items it is possible that
      // the element is not drawn on the canvas. Then the most
      // upper stage element (casePlanModel) is fetched and used
      // as the parent.
      var parents = getParents(element, 'cmmn:Stage') || [];
      commonParent = parents[parents.length-1];
    }

    // (3) Update the parent of the plan item definition.
    if (commonParent !== definition.$parent) {
      modeling.updateSemanticParent(definition, commonParent, containment);
    }

    // (4) Get direct children (plan item and discretionary items)
    // event if the containment of the plan item definition did not change.
    return getDirectItemCapables(definition);
  }


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
      var bo = getBusinessObject(element);
      var definition = getDefinition(bo);

      if (definition && definitions[definition.id]) {
        items[definition.id] = items[definition.id] || [];
        items[definition.id].push(bo);
      }

    });

    return items;
  }

}

PlanItemDefinitionUpdater.$inject = [ 'eventBus', 'elementRegistry', 'cmmnFactory', 'modeling' ];

inherits(PlanItemDefinitionUpdater, CommandInterceptor);

module.exports = PlanItemDefinitionUpdater;

/**
 * Utilities
 */

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
  }, []);
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


function toArray(elements) {
  if (!elements) {
    return [];
  }
  return isArray(elements) ? elements : [ elements ];
}


function UpdateContext() {

  this.definitions = {};
  this.items = [];

  this.counter = 0;

  this.addDefinition = function(element) {
    var definition = getDefinition(element) || element;
    this.definitions[definition.id] = definition;
  };

  this.addItem = function(element) {
    var bo = getBusinessObject(element) || element;
    this.items.push(bo);
  };

  this.add = function(element) {
    this.addDefinition(element);
    this.addItem(element);
  };

  this.enter = function() {
    this.counter++;
  };

  this.leave = function() {
    this.counter--;

    return !this.counter;
  };

}
