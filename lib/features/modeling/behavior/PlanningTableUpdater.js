'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor').default;

var some = require('min-dash').some,
    forEach = require('min-dash').forEach;

var ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    getDefinition = ModelUtil.getDefinition,
    getBusinessObject = ModelUtil.getBusinessObject;

var getParent = require('../util/ModelingUtil').getParent,
    isLabel = require('../util/ModelingUtil').isLabel,
    getParents = require('../util/ModelingUtil').getParents;

var PlanItemDefinitionUtil = require('../util/PlanItemDefinitionUtil'),
    isDiscretionaryToHumanTask = PlanItemDefinitionUtil.isDiscretionaryToHumanTask,
    isDiscretionaryItem = PlanItemDefinitionUtil.isDiscretionaryItem,
    isPlanFragment = PlanItemDefinitionUtil.isPlanFragment,
    getAllDiscretionaryItems = PlanItemDefinitionUtil.getAllDiscretionaryItems,
    isHumanTask = PlanItemDefinitionUtil.isHumanTask;


/**
 * A handler responsible for adding, moving and deleting discretionary items
 * and adding them to planning table. These changes are reflected to
 * the underlying CMMN 1.1 XML.
 */
function PlanningTableUpdater(eventBus, cmmnFactory, modeling, itemRegistry) {

  this._cmmnFactory = cmmnFactory;
  this._modeling = modeling;
  this._itemRegistry = itemRegistry;

  var self = this;

  CommandInterceptor.call(this, eventBus);

  var containment = 'tableItems';

  // CONNECTION /////////////////////////////////////////////


  // delete + reconnectEnd //////////////////////////////////


  this.preExecuted([ 'connection.delete', 'connection.reconnectEnd', 'connection.reconnectStart' ], function(event) {

    var context = event.context,
        isReconnectStart = (event.command === 'connection.reconnectStart'),
        connection = context.connection,
        target = connection.target;

    if (!isDiscretionaryConnection(connection)) {
      return;
    }

    if (isReconnectStart) {

      if (context.newSource && context.newTarget) {
        target = context.newSource;
        context.oldPlanningTable = getParentPlanningTable(target);
      }
      else {
        return;
      }

    }

    // (1) remember current
    context.planningTable = getParentPlanningTable(target);

    // (2) if the target did not change, then do nothing (in case of reconnectEnd)
    if (target === context.newTarget) {
      return;
    }

    // (3) is there at least another discretionary connection referencing
    // this target.
    // note: there could be multiple plan items (with the same definition -
    // human task) referencing the same discretionary item. in such case
    // the deletion/reconnection of a discretionary connection does not trigger
    // the deletion of the other discretionary connections. As a result, the
    // the discretionary item remains in its current planning table.
    if (isReferencedByAnotherDiscretionaryConnection(target, connection)) {
      return;
    }

    // (4) get new target definition of discretionary item
    var definition = getTargetDefinition(target.parent);

    // (5) create a planning table if necessary
    var planningTable = self.createPlanningTable(definition);

    // (6) move (current target) discretionary item from current planning table
    // to the new planning table
    modeling.updateSemanticParent(target, planningTable, containment);

  });


  this.postExecuted('connection.delete', function(context) {

    if (!isDiscretionaryConnection(context.connection)) {
      return;
    }

    // triggers deletion of planning table if it is empty
    self.deletePlanningTable(context.planningTable);

  }, true);


  this.postExecuted('connection.reconnectEnd', function(context) {

    var connection = context.connection,
        target = connection.target;

    if (!isDiscretionaryConnection(connection)) {
      return;
    }

    // (1) remember old planning table of new target
    var oldPlanningTable = getParentPlanningTable(target);

    // (2) add new target as discretionary item into the planning table of the source element
    modeling.updateSemanticParent(target, context.planningTable, containment);

    // (3) remove old planning table if its empty
    self.deletePlanningTable(oldPlanningTable);

  }, true);


  this.postExecuted('connection.reconnectStart', function(context) {

    var connection = context.connection;

    if (!isDiscretionaryConnection(connection)) {
      return;
    }

    if (!context.newSource || !context.newTarget) {
      return;
    }

    self.deletePlanningTable(context.oldPlanningTable);

  }, true);

  // create + reconnectStart ////////////////////////////////////////

  this.preExecuted([ 'connection.create', 'connection.reconnectStart' ], function(context) {

    var connection = context.connection,
        source = context.newSource || context.source,
        target = context.target || context.newTarget || connection.target;

    if (!isDiscretionaryConnection(connection)) {
      return;
    }

    // (1) remember planning table of target discretionary item
    context.planningTable = getParentPlanningTable(target);

    var definition = getDefinition(source);

    if (connection.source) {
      var oldDefinition = getDefinition(connection.source);
      if (oldDefinition === definition) {
        return;
      }
    }

    // (2) create a planning table if necessary
    var planningTable = self.createPlanningTable(definition);

    // (3) add target discretionary item to planning table
    modeling.updateSemanticParent(target, planningTable, containment);

  }, true);


  this.postExecuted([ 'connection.create', 'connection.reconnectStart' ], function(context) {

    var connection = context.connection;
    if (!isDiscretionaryConnection(connection)) {
      return;
    }

    // remove planning table if its empty
    self.deletePlanningTable(context.planningTable);

  }, true);


  // SHAPE /////////////////////////////////////////////////////////////////////////////

  this.preExecuted('elements.move', 500, function(context) {

    var allShapes = context.closure.allShapes,
        newParent = context.newParent,
        hints = context.hints,
        oldParent = hints && hints.primaryShape && hints.primaryShape.parent,
        replacements = context.definitionReplacements,
        replacedPlanningTableArray = [],
        planningTableReplacedBy = {};


    function clonePlanningTable(planningTable) {
      var newPlanningTable = cmmnFactory.create('cmmn:PlanningTable', {
        applicabilityRules: planningTable.applicabilityRules
      });
      var idx = replacedPlanningTableArray.push(planningTable);
      planningTableReplacedBy[idx-1] = newPlanningTable;

      return newPlanningTable;
    }


    if (!newParent || oldParent === newParent) {
      return;
    }


    forEach(allShapes, function(shape) {

      var bo = getBusinessObject(shape),
          newPlanningTables = [],
          discretionaryTo,
          replacedBy,
          items,
          planningTables,
          previousPlanningTable;


      if (!isDiscretionaryItem(shape) || isLabel(shape)) {
        return;
      }

      discretionaryTo = getParent(bo, 'cmmn:PlanItemDefinition');
      if (!is(discretionaryTo, 'cmmn:HumanTask')) {
        return;
      }

      replacedBy = replacements[discretionaryTo.id];
      if (!replacedBy) {
        return;
      }

      // discretionary item is already contained by replacement
      if ((getAllDiscretionaryItems(replacedBy) || []).indexOf(bo) !== -1) {
        return;
      }

      // have been all contained discretionary items moved?
      items = getAllDiscretionaryItems(discretionaryTo);
      var allMoved = !some(items, function(item) {
        return !allShapes[item.id];
      });


      if (allMoved) {

        // if yes, then just move planning table to replacement

        var planningTable = discretionaryTo.planningTable;

        modeling.updateProperties(replacedBy, {
          planningTable: planningTable
        }, itemRegistry.getShapes(replacedBy));

        modeling.updateSemanticParent(planningTable, replacedBy);

        modeling.updateProperties(discretionaryTo, {
          planningTable: undefined
        }, itemRegistry.getShapes(discretionaryTo));

        return;
      }


      planningTables = getParents(bo, 'cmmn:PlanningTable');

      if (planningTables && planningTables.length) {

        forEach(planningTables, function(planningTable) {

          var idx = replacedPlanningTableArray.indexOf(planningTable),
              newPlanningTable;

          if (idx === -1) {
            newPlanningTable = clonePlanningTable(planningTable);
          }
          else {
            newPlanningTable = planningTableReplacedBy[idx];
          }

          if (previousPlanningTable && !previousPlanningTable.$parent) {
            modeling.updateSemanticParent(previousPlanningTable, newPlanningTable, 'tableItems');
          }

          previousPlanningTable = newPlanningTable;
          newPlanningTables.push(newPlanningTable);

        });

        if (!replacedBy.planningTable) {

          modeling.updateProperties(replacedBy, {
            planningTable: previousPlanningTable
          }, itemRegistry.getShapes(replacedBy));
          modeling.updateSemanticParent(previousPlanningTable, replacedBy);

        }

        var first = newPlanningTables.splice(0, 1)[0],
            oldPlanningTable = getParentPlanningTable(bo);

        modeling.updateSemanticParent(bo, first, 'tableItems');

        self.deletePlanningTable(oldPlanningTable);
      }

    });

  }, true);


  this.preExecuted([ 'shape.create', 'shape.move' ], function(context) {

    var shape = context.shape;

    if (!isDiscretionaryItem(shape) || isLabel(shape)) {
      return;
    }

    // (1) if is discretionary to human task, then there is nothing to do
    // in case of 'shape.move'
    if (isDiscretionaryToHumanTask(shape)) {
      return;
    }

    // remember old planning table
    context.planningTable = getParentPlanningTable(shape);

    var newParent = context.parent || context.newParent;

    if (newParent) {

      // (2) parent changed

      var definition = getTargetDefinition(newParent);

      // (3) create new planning table if necessary
      var planningTable = self.createPlanningTable(definition);

      // (4) add discretionary item to planning table
      modeling.updateSemanticParent(shape, planningTable, containment);
    }

  }, true);


  this.postExecuted('shape.move', function(context) {

    var shape = context.shape;

    if (!isDiscretionaryItem(shape) || isLabel(shape)) {
      return;
    }

    // if an item which is discretionary to a human task is moved,
    // then no update is necessary
    if (isDiscretionaryToHumanTask(shape)) {
      return;
    }

    self.deletePlanningTable(context.planningTable);

  }, true);


  this.preExecuted('shape.delete', function(context) {

    var shape = context.shape;

    if (!isDiscretionaryItem(shape) || isLabel(shape)) {
      return;
    }

    // remember old planning table
    context.planningTable = getParentPlanningTable(shape);

    // remove discretionary item from planning table
    modeling.updateSemanticParent(shape, null, containment);

  }, true);


  this.postExecuted('shape.delete', function(context) {

    var shape = context.shape;

    if (!isDiscretionaryItem(shape) || isLabel(shape)) {
      return;
    }

    self.deletePlanningTable(context.planningTable);

  }, true);


  this.postExecuted('shape.delete', 500, function(context) {

    var shape = context.shape;

    var definition = getDefinition(shape);

    if (!isHumanTask(definition) || definition.$parent) {
      return;
    }

    var discretionaryItems = getAllDiscretionaryItems(definition);

    // repair the model
    forEach(discretionaryItems, function(item) {
      var shapeItem = itemRegistry.getShape(item.id);

      if (shapeItem) {
        // get new target definition of discretionary item
        var definition = getTargetDefinition(shapeItem.parent);

        // create a planning table if necessary
        var planningTable = self.createPlanningTable(definition);

        // move (current target) discretionary item from current planning table
        // to the new planning table
        modeling.updateSemanticParent(shapeItem, planningTable, containment);
      }

    });

    if (definition.planningTable) {
      self.deletePlanningTable(definition.planningTable);
    }

  }, true);

  // API ////////////////////////////////////////////////////////

  /**
   * Creates a new planning table for the given definition, if necessary.
   *
   * If the given definition already contains a planning table, this
   * planning table is returned.
   *
   * @param {ModdleElement} definition where the planning table is added
   *
   * @return {ModdleElement} the create planning table
   */
  this.createPlanningTable = function(definition) {

    var planningTable = definition.planningTable;

    if (!planningTable) {

      // (1) create new planning table
      planningTable = self._cmmnFactory.create('cmmn:PlanningTable');

      // (2) filter all items which are affected by adding a planning
      // table to its definition
      var shapes = itemRegistry.getShapes(definition);

      // (3) set planning table
      modeling.updateProperties(definition, {
        planningTable: planningTable
      }, shapes);

      // (4) set parent of planning table to definition
      modeling.updateSemanticParent(planningTable, definition);
    }


    return planningTable;
  };


  /**
   * Deletes a given planning table from the definition. If the planning
   * table is nested inside other planning tables, then the plannings tables
   * are also deleted, if they do not contain any element.
   *
   * @param {ModdleElement} planningTable to delete
   *
   */
  this.deletePlanningTable = function(planningTable) {

    // According to spec: a planning table must contain at least one element.
    // if it does not contain any element, then the planning table is deleted.

    // (1) cannot delete planning table if contains at least one element
    if (planningTable.get(containment).length > 0) {
      return;
    }

    // (2) if planning table does not contain any element, then remove it
    var oldParent = planningTable.$parent;
    while (is(oldParent, 'cmmn:PlanningTable') && !planningTable.get(containment).length) {
      modeling.updateSemanticParent(planningTable, null, containment);
      planningTable = oldParent;
      oldParent = oldParent.$parent;
    }

    if (is(oldParent, 'cmmn:PlanItemDefinition')) {

      if (planningTable && !planningTable.get(containment).length) {

        // (3) get definition containing this planning table
        var definition = getParent(planningTable, 'cmmn:PlanItemDefinition');

        // (4) filter all items which are affected by removing this planning
        // table from its definition
        var shapes = itemRegistry.getShapes(definition);

        // (5) set planning table attribute to undefined
        modeling.updateProperties(definition, {
          planningTable: undefined
        }, shapes);

        // (6) set planning tables parent to null
        modeling.updateSemanticParent(planningTable, null, null);
      }
    }
  };


  /**
   * Returns true, if there is another incoming discretionary connection
   * apart the given connection.
   *
   * @param {djs.mode.Base} shape
   * @param {djs.mode.Base} connection
   *
   * @return {boolean} if there is another incoming discretionary connection
   */
  function isReferencedByAnotherDiscretionaryConnection(shape, connection) {
    return some(shape.incoming, function(con) {
      return con !== connection && isDiscretionaryConnection(con);
    });
  }


  function isDiscretionaryConnection(connection) {
    return !connection.businessObject.cmmnElementRef;
  }

}

PlanningTableUpdater.$inject = [
  'eventBus',
  'cmmnFactory',
  'modeling',
  'itemRegistry'
];

inherits(PlanningTableUpdater, CommandInterceptor);

module.exports = PlanningTableUpdater;


function getTargetDefinition(shape) {
  var target = fixTarget(shape);
  return getDefinition(target) || getBusinessObject(target);
}

/**
 * Fixes the target.
 * A discretionary item cannot be added to plan fragment,
 * in that case the discretionary item is added to the visual
 * surrounding stage.
 *
 * @param {djs.model.Base} target
 *
 * @return {djs.model.Base} the fixed target
 */
function fixTarget(target) {
  if (target && !isCasePlanModel(target)) {

    var definition = getDefinition(target);

    if (isPlanFragment(definition)) {
      target = getParent(target, [
        'cmmn:Stage',
        'cmmn:PlanItem',
        'cmmn:DiscretionaryItem'
      ]);
      target = fixTarget(target);
    }
  }

  return target;
}


/**
 * Returns parent planning table of the given element.
 *
 * @param {ModdleElement} element
 *
 * @param {ModdleElement} the parent planning table
 */
function getParentPlanningTable(element) {
  element = getBusinessObject(element);
  return getParent(element, 'cmmn:PlanningTable');
}
