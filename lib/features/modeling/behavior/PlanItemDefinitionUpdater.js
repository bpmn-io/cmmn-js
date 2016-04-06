'use strict';

var inherits = require('inherits');

var find = require('lodash/collection/find'),
    any = require('lodash/collection/any');

var Collections = require('diagram-js/lib/util/Collections');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    getDefinition = ModelUtil.getDefinition,
    getBusinessObject = ModelUtil.getBusinessObject;

var ModelingUtil = require('../util/ModelingUtil'),
    getParents = ModelingUtil.getParents,
    getParent = ModelingUtil.getParent,
    isSameCase = ModelingUtil.isSameCase;

/**
 * A handler responsible for updating parent relation of a plan item definition
 * to the underlying CMMN 1.1 XML + DI once changes on the diagram happen.
 */
function PlanItemDefinitionUpdater(eventBus, cmmnFactory, modeling) {

  this._cmmnFactory = cmmnFactory;
  this._modeling = modeling;

  var self = this;

  CommandInterceptor.call(this, eventBus);


  this.preExecuted('shape.create', function(context) {

    var shape = context.shape;

    if (!isCandidate(shape)) {
      return;
    }

    // (1) get the target element
    var target = getBusinessObject(context.parent);

    // (2) fix target (in case the target is a plan fragment)
    var newParent = fixTarget(target);

    // (3) remember the new plan item definition parent
    context.newPlanItemDefinitionParent = newParent;

  }, true);


  this.preExecuted('shape.delete', function(context) {

    var shape = context.shape;

    if (!isCandidate(shape)) {
      return;
    }

    var bo = getBusinessObject(shape),
        definition = bo.definitionRef;

    // (1) get the old parent
    var oldParent = definition.$parent;

    // (2) is the definition referenced by other plan or discretionary items
    var isSharedPlanItemDefinition = isReferencedByItem(definition, bo);

    // (3) if it is a shared definition then set oldParent to null to not
    // delete the definition
    oldParent = !isSharedPlanItemDefinition ? oldParent : null;

    // (4) remember the old plan item definition parent
    context.oldPlanItemDefinitionParent = oldParent;

  }, true);


  this.preExecuted('shape.move', function(context) {

    var shape = context.shape;

    if (!isCandidate(shape)) {
      return;
    }

    var bo = getBusinessObject(shape),
        definition = bo.definitionRef;

    var oldParent = definition.$parent;

    // (1) get the target element
    var target = getBusinessObject(context.newParent);

    // (2) fix target (in case the target is a plan fragment)
    var newParent = fixTarget(target);

    if (newParent) {

      // <!> the parent of the moved item has changed <!>

      var isSharedPlanItemDefinition = false;

      // (3) the new parent is part of the same case
      if (isSameCase(oldParent, newParent)) {

        // (4) if the new parent is a case plan model, then
        // use it as the new parent, if not ...

        if (!isCasePlanModel(newParent)) {

          // (5) ... then verify whether the given definition
          // is referenced by other plan or discretionary items
          isSharedPlanItemDefinition = isReferencedByItem(definition, bo);
          if (isSharedPlanItemDefinition) {

            // (6) if it is a shared definition then determine the proper
            // parent element
            newParent = getNewParent(definition, newParent);
          }
        }
      }
      else {

        // (7) the new parent is part of another case

        // (8) is the definition referenced by other plan or discretionary items
        isSharedPlanItemDefinition = isReferencedByItem(definition, bo);
        if (isSharedPlanItemDefinition) {

          // (9) set the old parent to null, since we have to keep the definition
          oldParent = null;

          // (10) create a copy of the given definition

          var type = definition.$type;
          // TODO: copy in a proper way the properties of
          // the already existing plan item definition
          var newDefinition = self._cmmnFactory.create(type, {
            name: definition.name
          });

          // (11) update the definitionRef property of the item
          modeling.updateProperties(shape, {
            definitionRef: newDefinition
          });
        }

        // (12) if isSharedPlanItemDefinition === false, then the definition
        // can be also moved to the other case

      }

    }
    else {
      // <!> the parent of the moved item has not changed <!>

      // (13) parent did not change
      newParent = oldParent;
    }

    // (14) remember the old plan item definition parent
    context.oldPlanItemDefinitionParent = oldParent;
    context.newPlanItemDefinitionParent = newParent;

  }, true);


  this.executed([ 'shape.create', 'shape.delete', 'shape.move' ], function(context) {

    var shape = context.shape;

    if (!isCandidate(shape)) {
      return;
    }

    var newParent = context.newPlanItemDefinitionParent;
    var oldParent = context.oldPlanItemDefinitionParent;

    self.updateSemanticParent(getDefinition(shape), oldParent, newParent);

  }, true);


  this.reverted([ 'shape.create', 'shape.delete', 'shape.move' ], function(context) {

    var shape = context.shape;

    if (!isCandidate(shape)) {
      return;
    }

    var oldParent = context.newPlanItemDefinitionParent;
    var newParent = context.oldPlanItemDefinitionParent;

    self.updateSemanticParent(getDefinition(shape), oldParent, newParent);

  }, true);

}

PlanItemDefinitionUpdater.$inject = [ 'eventBus', 'cmmnFactory', 'modeling' ];

inherits(PlanItemDefinitionUpdater, CommandInterceptor);

module.exports = PlanItemDefinitionUpdater;

/**
 * Updates the parent relation of a plan item definition:
 *
 * - if the 'oldParent' is defined, then the plan item definition
 *   is removed from the old parent by updating the collection
 *   'planItemDefinitions'
 * - if the 'newParent' is defined, then the plan item definition
 *   is added to the new parent by updating the collection
 *   'planItemDefinitions'
 *
 * @param {ModdleElement} planItemDefinition the affected plan item definition
 * @param {ModdleElement} oldParent the old parent of the plan item definition
 * @param {ModdleElement} newParent the new parent of the plan item definition
 *
 */
PlanItemDefinitionUpdater.prototype.updateSemanticParent =  function(planItemDefinition, oldParent, newParent) {

  if (oldParent === newParent) {
    return;
  }

  var children;

  if (oldParent) {
    // remove from old parent
    children = oldParent.get('planItemDefinitions');
    Collections.remove(children, planItemDefinition);
    planItemDefinition.$parent = null;
  }

  if (newParent) {
    // add to new parent
    children = newParent.get('planItemDefinitions');
    children.push(planItemDefinition);
    planItemDefinition.$parent = newParent;
  }
};


/**
 * If the given target is a plan fragment, then
 * the next parent stage is returned as the fixed
 * target.
 *
 * @param {ModdleElement} target the actual target
 *
 * @return {ModdleElement} the fixed target
 */
function fixTarget(target) {

  if (target && !isCasePlanModel(target)) {

    target = target.definitionRef;

    if (isPlanFragment(target)) {
      target = getParent(target, 'cmmn:Stage');
    }
  }

  return target;

}


/**
 * Returns true if the given element is a plan item or a
 * discretionary item.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is a plan item or a discretionary item
 */
function isCandidate(element) {
  return isPlanItem(element) || isDiscretionaryItem(element);
}


/**
 * Returns true if the given element is a plan item.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is a plan item
 */
function isPlanItem(element) {
  return is(element, 'cmmn:PlanItem');
}


/**
 * Returns true if the given element is a discretionary item.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is a discretionary item
 */
function isDiscretionaryItem(element) {
  return is(element, 'cmmn:DiscretionaryItem');
}


/**
 * Returns true if the given element is a plan fragment and not
 * a stage.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is a plan fragment
 */
function isPlanFragment(element) {
  return is(element, 'cmmn:PlanFragment') && !isStage(element);
}


/**
 * Returns true if the given element is a stage.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is a stage
 */
function isStage(element) {
  return is(element, 'cmmn:Stage');
}


/**
 * Returns to true if the given plan item definition
 * is referenced by a plan item or a discretionary item.
 *
 * If the parameter 'exceptItem' is not undefined, then
 * this item is not taken into account to determine whether
 * the plan item definition is referenced by an item or not
 * (this parameter can be used to verify whether the plan item
 * is referenced by multiple items or not).
 *
 * @param {ModdleElement} planItemDefinition to check
 * @param {ModdleElement|undefined} exceptItem to not check
 *
 * @return {boolean}
 */
function isReferencedByItem(planItemDefinition, exceptItem) {


  function isReferencingPlanItemDefinition(item) {
    var definition = item.definitionRef;
    return !!(exceptItem !== item && definition === planItemDefinition);
  }


  function handleContainer(element) {
    var isReferenced = false;

    // (1) check all plan items
    if (element.planItems) {
      isReferenced = any(element.planItems, function(item) {
        return isReferencingPlanItemDefinition(item);
      });
    }

    if (!isReferenced && element.planItemDefinitions) {
      isReferenced = any(element.planItemDefinitions, function(definition) {

        // (2) check children of a plan fragment or stage
        if (isPlanFragment(definition) || isStage(definition)) {
          return handleContainer(definition);
        }

        // (3) check planning table of human task
        if (is(definition, 'cmmn:HumanTask')) {
          return handlePlanningTable(definition.planningTable);
        }

        return false;

      });
    }


    // (4) check planning table
    if (!isReferenced && element.planningTable) {
      isReferenced = handlePlanningTable(element.planningTable);
    }

    return isReferenced;
  }


  function handlePlanningTable(planningTable, context) {
    return !!planningTable && any(planningTable.tableItems, function (item) {

      if (isDiscretionaryItem(item)) {
        return isReferencingPlanItemDefinition(item);
      }

      return handlePlanningTable(item);

    });
  }


  var parent = planItemDefinition.$parent;
  return !!(parent && handleContainer(parent));
}

/**
 * Depending on the target the new parent of the plan item definition
 * is returned.
 * Therefor the executed movement must be calculated. The following movements
 * are possible:
 * - the item has been moved from a nested container into a parent container
 * - the item has been moved into a nested container
 * - the item has been moved to a sibling branch
 *
 * @param {ModdleElement} planItemDefinition to move
 * @param {ModdleElement} target the actual target
 *
 * @return {ModdleElement} the new target
 */
function getNewParent(planItemDefinition, target) {

  var scope = planItemDefinition.$parent;

  // (1) does the target already contains the plan item definition
  if (scope === target) {
    return target;
  }

  // (2) is the plan item definition reachable from the target element
  var targetParents = getParents(target, 'cmmn:Stage');
  if (targetParents.indexOf(scope) !== -1) {
    return scope;
  }

  // (3) has been the shape moved from a nested stage to a
  // parent stage (which contains the nested stage directly or
  // transitively)
  var scopeParents = getParents(scope, 'cmmn:Stage');
  if (scopeParents.indexOf(target) !== -1) {
    return target;
  }

  // (4) if the cases (1+2+3) does not suit, then
  // the shape has been moved to a sibling, then
  // find the smallest common parent stage
  var newParent = find(targetParents, function(elem) {
    return scopeParents.indexOf(elem) !== -1;
  });

  if (!newParent) {
    // (5) if there is case where we did not find a
    // parent then the new parent is the case plan model
    var _case = getParent(target, 'cmmn:Case');
    newParent = _case.casePlanModel;
  }

  return newParent;
}
