'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var any = require('lodash/collection/any');
var forEach = require('lodash/collection/forEach');

var ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    getDefinition = ModelUtil.getDefinition,
    getBusinessObject = ModelUtil.getBusinessObject;

var getParent = require('../util/ModelingUtil').getParent;

var PlanItemDefinitionUtil = require('../util/PlanItemDefinitionUtil'),
    isDiscretionaryToHumanTask = PlanItemDefinitionUtil.isDiscretionaryToHumanTask,
    isDiscretionaryItem = PlanItemDefinitionUtil.isDiscretionaryItem,
    isPlanFragment = PlanItemDefinitionUtil.isPlanFragment,
    getAllDiscretionaryItems = PlanItemDefinitionUtil.getAllDiscretionaryItems,
    isHumanTask = PlanItemDefinitionUtil.isHumanTask;

var isDiscretionaryConnection = require('../util/ConnectionUtil').isDiscretionaryConnection;


/**
 * A handler responsible for adding, moving and deleting discretionary items
 * and adding them to planning table. These changes are reflected to
 * the underlying CMMN 1.1 XML.
 */
function PlanningTableUpdater(eventBus, cmmnFactory, modeling, elementRegistry) {

  this._cmmnFactory = cmmnFactory;
  this._modeling = modeling;
  this._elementRegistry = elementRegistry;

  var self = this;

  CommandInterceptor.call(this, eventBus);

  var containment = 'tableItems';

  // CONNECTION /////////////////////////////////////////////


  // delete + reconnectEnd //////////////////////////////////


  this.preExecuted([ 'connection.delete', 'connection.reconnectEnd' ], function(context) {

    var connection = context.connection,
        target = connection.target;

    if (!isDiscretionaryConnection(connection)) {
      return;
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

  }, true);


  this.postExecuted('connection.delete', function(context) {

    var source = context.source,
        target = context.target;

    if (!isDiscretionaryConnection(context.connection, source, target)) {
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


  // create + reconnectStart ////////////////////////////////////////

  this.preExecuted([ 'connection.create', 'connection.reconnectStart' ], function(context) {

    var connection = context.connection,
        source = context.newSource || context.source,
        target = context.target || connection.target;

    if (!isDiscretionaryConnection(connection, source, target)) {
      return;
    }

    // (1) remember planning table of target discretionary item
    context.planningTable = getParentPlanningTable(target);

    // (2) create a planning table if necessary
    var definition = getDefinition(source);
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


  this.preExecuted([ 'shape.create', 'shape.move' ], function(context) {

    var shape = context.shape;

    if (!isDiscretionaryItem(shape)) {
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


  this.preExecuted('shape.delete', function(context) {

    var shape = context.shape;

    if (!isDiscretionaryItem(shape)) {
      return;
    }

    // remember old planning table
    context.planningTable = getParentPlanningTable(shape);

    // remove discretionary item from planning table
    modeling.updateSemanticParent(shape, null, containment);

  }, true);


  this.postExecuted([ 'shape.move', 'shape.delete' ], function(context) {

    var shape = context.shape;

    if (!isDiscretionaryItem(shape)) {
      return;
    }

    // if an item which is discretionary to a human task is moved,
    // then no update is necessary
    if (isDiscretionaryToHumanTask(shape)) {
      return;
    }

    self.deletePlanningTable(context.planningTable);

  }, true);



  this.postExecuted('shape.delete', function(context) {

    var shape = context.shape;

    var definition = getDefinition(shape);

    if (!isHumanTask(definition)) {
      return;
    }

    var discretionaryItems = getAllDiscretionaryItems(definition);

    // repair the model
    forEach(discretionaryItems, function(item) {
      var shapeItem = self._elementRegistry.get(item.id);

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
      var shapes = this._elementRegistry.filter(filterByDefinition(definition));

      // (3) set planning table
      modeling.updateProperties(definition, {
        planningTable: planningTable
      }, shapes);

      // (4) set parent of planning table to definition
      modeling.updateSemanticParent(planningTable, definition, null);
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
    while(is(oldParent, 'cmmn:PlanningTable') && oldParent.get(containment).length === 1) {
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
        var shapes = this._elementRegistry.filter(filterByDefinition(definition));

        // (5) set planning table attribute to undefined
        modeling.updateProperties(definition, {
          planningTable: undefined
        }, shapes);

        // (6) set planning tables parent to null
        modeling.updateSemanticParent(planningTable, null, null);
      }
    }
  };

}

PlanningTableUpdater.$inject = [ 'eventBus', 'cmmnFactory', 'modeling', 'elementRegistry' ];

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
 * Returns a function which can be used as filter
 * condition to retrieve all shapes defined by
 * the same plan item definition.
 *
 * @param {ModdleElement} definition
 *
 * @param {function} filter function
 */
function filterByDefinition(definition) {
  return function(element) {
    var bo = getBusinessObject(element);
    var def = getDefinition(bo) || bo;
    return def === definition;
  };
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
  return any(shape.incoming, function(con) {
    return con !== connection && isDiscretionaryConnection(con);
  });
}
