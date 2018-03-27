'use strict';

var ModelUtil = require('../../util/ModelUtil'),
    is = ModelUtil.is,
    getDefinition = ModelUtil.getDefinition,
    isAutoComplete = ModelUtil.isAutoComplete;

var isCollapsed = require('../../util/DiUtil').isCollapsed,
    isPlanningTableCollapsed = require('../../util/DiUtil').isPlanningTableCollapsed;

var isPlanningTableCapable = require('../modeling/util/PlanItemDefinitionUtil').isPlanningTableCapable;
var isItemCapable = require('../modeling/util/PlanItemDefinitionUtil').isItemCapable;

/**
 * This module takes care of replacing CMMN elements
 */
function CmmnReplace(cmmnFactory, replace, selection, cmmnRules) {

  /**
   * Prepares a new business object for the replacement element
   * and triggers the replace operation.
   *
   * @param  {djs.model.Base} element
   * @param  {Object} target
   * @param  {Object} [hints]
   *
   * @return {djs.model.Base} the newly created element
   */
  function replaceElement(element, target, hints) {

    hints = hints || {};

    var type = target.type,
        oldBusinessObject = element.businessObject,
        newBusinessObject;


    // TODO: need also to respect min/max Size
    var newElement = {
      type: type
    };

    if (isCriterion(oldBusinessObject)) {
      newBusinessObject = replaceCriterion(oldBusinessObject, type);
    }


    if (isItemCapable(oldBusinessObject)) {

      var oldDefinition = getDefinition(oldBusinessObject),
          definitionType = target.definitionType,
          newDefinition = oldDefinition;


      // replace plan item definition if necessary
      if (oldDefinition.$type !== definitionType) {
        newDefinition = replacePlanItemDefinition(oldDefinition, definitionType);
      }


      // replace plan/discretionary item
      newBusinessObject = replaceItemCapable(oldBusinessObject, type, newDefinition);


      // handle isCollapsed property
      if (isPlanFragment(oldDefinition) && isPlanFragment(newDefinition) && target.isCollapsed !== false) {
        newElement.isCollapsed = isCollapsed(oldBusinessObject);
      }


      // switch collapsed/expanded plan fragment
      if (isTask(oldDefinition) && target.isCollapsed === true) {
        newElement.isCollapsed = true;
      }

      if (isTask(newDefinition) && target.isBlocking === false) {
        newElement.isBlocking = false;
      }


      // handle isPlanningTableCollapsed property
      if (isPlanningTableCapable(oldDefinition) && isPlanningTableCapable(newDefinition)) {
        newElement.isPlanningTableCollapsed = isPlanningTableCollapsed(oldBusinessObject);
      }


      // handle autoComplete property
      if (isStage(oldDefinition) && isStage(newDefinition)) {
        newElement.autoComplete = isAutoComplete(oldBusinessObject);
      }


      // TODO: need also to respect min/max Size
      // copy size, from an expanded plan fragment to an expanded alternative plan fragment
      // except cmmn:Task, because Task is always expanded
      if (!isCollapsed(oldBusinessObject) && !target.isCollapsed && !isTask(oldDefinition)) {
        newElement.width = element.width;
        newElement.height = element.height;
      }
    }

    // create new business object if necessary
    newElement.businessObject = newBusinessObject || cmmnFactory.create(type);

    // trigger replacement
    newElement = replace.replaceElement(element, newElement, hints);


    if (hints.select !== false) {
      selection.select(newElement);
    }

    return newElement;
  }

  this.replaceElement = replaceElement;


  function replaceCriterion(criterion, type) {

    var newCriterion;

    if (criterion) {

      type = type || criterion.$type;

      newCriterion = cmmnFactory.createCriterion(type, {
        sentryRef: criterion.sentryRef,
        name: criterion.name
      });

    }

    return newCriterion;

  }

  this.replaceCriterion = replaceCriterion;


  function replaceSentry(sentry) {

    var newSentry;

    if (sentry) {

      newSentry = cmmnFactory.createSentry({
        name: sentry.name
      });

      if (sentry.ifPart) {

        var newIfPart = cmmnFactory.create('cmmn:IfPart');
        setParent(newIfPart, newSentry);
        newSentry.ifPart = newIfPart;

        var condition = replaceCondition(sentry.ifPart.condition);
        setParent(condition, newIfPart);
        newIfPart.condition = condition;

      }

    }

    return newSentry;
  }

  this.replaceSentry = replaceSentry;


  function replacePlanItemDefinition(definition, type) {

    type = type || definition.$type;

    var newDefinition = cmmnFactory.create(type, {
      name: definition.name
    });

    if (isPlanItemControlCapable(newDefinition) && definition.defaultControl) {

      var defaultControl = replacePlanItemControl(definition.defaultControl, newDefinition);

      setParent(defaultControl, newDefinition);
      newDefinition.defaultControl = defaultControl;

    }

    if (isStage(newDefinition) && definition.autoComplete) {
      newDefinition.autoComplete = definition.autoComplete;
    }

    if (isTask(definition) && isTask(newDefinition)) {
      newDefinition.isBlocking = definition.isBlocking;
    }

    return newDefinition;

  }

  this.replacePlanItemDefinition = replacePlanItemDefinition;


  function replaceItemCapable(item, type, definition) {

    type = type || item.$type;
    definition = definition || getDefinition(item);

    var newItem = cmmnFactory.create(type, {
      name: item.name,
      definitionRef: definition
    });

    if (isPlanItemControlCapable(newItem) && item.itemControl) {

      var itemControl = replacePlanItemControl(item.itemControl, newItem);

      setParent(itemControl, newItem);
      newItem.itemControl = itemControl;

    }

    return newItem;

  }

  this.replaceItemCapable = replaceItemCapable;


  function replacePlanItemControl(control, element) {

    var newControl;

    if (control) {

      newControl = cmmnFactory.create('cmmn:PlanItemControl');

      var repetitionRule = control.repetitionRule;
      if (repetitionRule && (!element || cmmnRules.canSetRepetitionRule(element))) {

        repetitionRule = replaceRule(repetitionRule);

        setParent(repetitionRule, newControl);
        newControl.repetitionRule = repetitionRule;

      }

      var requiredRule = control.requiredRule;
      if (requiredRule && (!element || cmmnRules.canSetRequiredRule(element))) {

        requiredRule = replaceRule(requiredRule);

        setParent(requiredRule, newControl);
        newControl.requiredRule = requiredRule;

      }

      var manualActivationRule = control.manualActivationRule;
      if (manualActivationRule && (!element || cmmnRules.canSetManualActivationRule(element))) {

        manualActivationRule = replaceRule(manualActivationRule);

        setParent(manualActivationRule, newControl);
        newControl.manualActivationRule = manualActivationRule;

      }

    }

    return newControl;

  }

  this.replacePlanItemControl = replacePlanItemControl;


  function replaceRule(rule) {

    var newRule;

    if (rule) {

      var type = rule.$type;

      var condition = replaceCondition(rule.condition);
      newRule = cmmnFactory.create(type, {
        condition: condition
      });

      setParent(condition, newRule);

    }

    return newRule;

  }

  this.replaceRule = replaceRule;


  function replaceCondition(condition) {
    var newCondition;

    if (condition) {
      newCondition = cmmnFactory.create('cmmn:Expression', {
        language: condition.language,
        body: condition.body
      });
    }

    return newCondition;
  }

  this.replaceCondition = replaceCondition;


  function setParent(element, parent) {
    if (element) {
      element.$parent = parent;
    }
  }

}

CmmnReplace.$inject = [ 'cmmnFactory', 'replace', 'selection', 'cmmnRules' ];

module.exports = CmmnReplace;

function isInstanceOf(element, type) {
  element = getDefinition(element);
  return is(element, type);
}

function isTask(element) {
  return isInstanceOf(element, 'cmmn:Task');
}

function isMilestone(element) {
  return isInstanceOf(element, 'cmmn:Milestone');
}

function isPlanFragment(element) {
  return isInstanceOf(element, 'cmmn:PlanFragment');
}

function isStage(element) {
  return isInstanceOf(element, 'cmmn:Stage');
}

function isCriterion(element) {
  return is(element, 'cmmn:Criterion');
}

function isPlanItemControlCapable(element) {
  return isTask(element) || isStage(element) || isMilestone(element);
}