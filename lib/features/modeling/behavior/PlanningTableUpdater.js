'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    getDefinition = ModelUtil.getDefinition,
    getBusinessObject = ModelUtil.getBusinessObject;

var getParent = require('../util/ModelingUtil').getParent,
    isDiscretionaryItem = require('../util/PlanItemDefinitionUtil').isDiscretionaryItem;


/**
 * A handler responsible for adding, moving and deleting discretionary items
 * and adding them to planning table. These changes are reflected to
 * the underlying CMMN 1.1 XML.
 */
function PlanningTableUpdater(eventBus, cmmnFactory, modeling) {

  this._cmmnFactory = cmmnFactory;
  this._modeling = modeling;

  var self = this;

  CommandInterceptor.call(this, eventBus);


  this.preExecuted([ 'shape.create', 'shape.move' ], function(context) {

    var shape = context.shape;

    if (!isDiscretionaryItem(shape)) {
      return;
    }

    var item = getBusinessObject(shape);

    // if an item which is discretionary to a human task is moved,
    // then no update is necessary
    if (isDiscretionaryToHumanTask(item)) {
      return;
    }

    var newParent = context.parent || context.newParent;

    if (newParent) {

      var target = fixTarget(newParent),
          targetBusinessObject = getBusinessObject(target),
          definition = targetBusinessObject.definitionRef || targetBusinessObject;

      var planningTable = definition.planningTable;

      if (!planningTable) {
        planningTable = self.createPlanningTable(target, definition);
      }

      modeling.updateSemanticParent(item, planningTable, 'tableItems', shape);
    }

  }, true);


  this.preExecuted('shape.delete', function(context) {

    var shape = context.shape;

    if (!isDiscretionaryItem(shape)) {
      return;
    }

    modeling.updateSemanticParent(shape, null, 'tableItems');

  }, true);


  this.preExecute([ 'shape.delete', 'shape.move'], function(context) {
    var shape = context.shape;

    if (!isDiscretionaryItem(shape)) {
      return;
    }

    var item = getBusinessObject(shape);

    context.planningTable = item.$parent;

  }, true);


  this.postExecuted([ 'shape.delete', 'shape.move' ], function(context) {

    var shape = context.shape;

    if (!isDiscretionaryItem(shape)) {
      return;
    }

    // if an item which is discretionary to a human task is moved,
    // then no update is necessary
    if (isDiscretionaryToHumanTask(shape)) {
      return;
    }

    var oldParent = fixTarget(context.oldParent),
        bo = getBusinessObject(oldParent);

    var definition = getDefinition(bo) || bo;
    self.deletePlanningTable(oldParent, definition, context.planningTable);

  }, true);


  // API ////////////////////////////////////////////////////////

  /**
   * Creates a new planning table for the given definition.
   *
   * @param {djs.model.Base} shape the affected shape
   * @param {djs.model.Base} definition where the planning table is added
   *
   * @return {ModdleElement} the create planning table
   */
  this.createPlanningTable = function(shape, definition) {

    var planningTable = self._cmmnFactory.create('cmmn:PlanningTable');

    modeling.updateProperties(shape, {
      planningTable: planningTable
    }, definition);

    modeling.updateSemanticParent(planningTable, definition, null, shape);

    return planningTable;
  };


  /**
   * Deletes a given planning table from the definition. If the planning
   * table is nested inside other planning tables, then the plannings tables
   * are also deleted, if they do not contain any element.
   *
   * @param {djs.model.Base} shape the affected shape
   * @param {ModdleElement} planningTable to delete
   * @param {ModdleElement} definition which contains the planning table
   *
   */
  this.deletePlanningTable = function(shape, definition, planningTable) {

    // According to spec: a planning table must contain at least one element.
    // if it does not contain any element, then the planning table is deleted.

    if (planningTable.get('tableItems').length > 0) {
      return;
    }   

    var oldParent = planningTable.$parent;
    while(is(oldParent, 'cmmn:PlanningTable') && oldParent.get('tableItems').length === 1) {
      modeling.updateSemanticParent(planningTable, null, 'tableItems', shape);
      planningTable = oldParent;
      oldParent = oldParent.$parent;
    }

    if (is(oldParent, 'cmmn:PlanItemDefinition')) {

      if (planningTable && !planningTable.get('tableItems').length) {
        modeling.updateProperties(shape, {
          planningTable: undefined
        }, definition);

        modeling.updateSemanticParent(planningTable, null, null, shape);
      }
    }
  };

}

PlanningTableUpdater.$inject = [ 'eventBus', 'cmmnFactory', 'modeling' ];

inherits(PlanningTableUpdater, CommandInterceptor);

module.exports = PlanningTableUpdater;


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
 * Returns true, iff the given element is a plan fragment and not
 * a stage.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is a plan fragment
 */
function isPlanFragment(element) {
  return is(element, 'cmmn:PlanFragment') && !is(element, 'cmmn:Stage');
}


/**
 * Returns true, iff the given element is a human task.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is a human task
 */
function isHumanTask(element) {
  return is(element, 'cmmn:HumanTask');
}


/**
 * Returns true, iff the given element is a discretionary to a human task.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is discretionary to a human task
 */
function isDiscretionaryToHumanTask(element) {
  var bo = getBusinessObject(element);
  var parent = getParent(bo, 'cmmn:PlanItemDefinition');
  return isHumanTask(parent);
}