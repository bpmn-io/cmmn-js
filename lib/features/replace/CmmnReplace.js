'use strict';

var ModelUtil = require('../../util/ModelUtil'),
    is = ModelUtil.is,
    getDefinition = ModelUtil.getDefinition,
    isAutoComplete = ModelUtil.isAutoComplete;

var isCollapsed = require('../../util/DiUtil').isCollapsed,
    isPlanningTableCollapsed = require('../../util/DiUtil').isPlanningTableCollapsed;

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
      type: type,
      width: element.width,
      height: element.height
    };

    if (is(oldBusinessObject, 'cmmn:Criterion')) {
      newBusinessObject = replaceCriterion(oldBusinessObject, type);
    }

    if (is(oldBusinessObject, 'cmmn:PlanItem') || is(oldBusinessObject, 'cmmn:DiscretionaryItem')) {

      var oldDefinition = getDefinition(oldBusinessObject),
          definitionType = target.definitionType,
          newDefinition;

      if (oldDefinition.$type === definitionType) {
        newDefinition = oldDefinition;
      }
      else {
        newDefinition = replacePlanItemDefinition(oldDefinition, definitionType);
      }
      
      newBusinessObject = replaceItemCapable(oldBusinessObject, type, newDefinition);

      if (is(newDefinition, 'cmmn:PlanFragment')) {
        newElement.isCollapsed = isCollapsed(oldBusinessObject);
      }

      if (is(newDefinition, 'cmmn:HumanTask') || is(newDefinition, 'cmmn:Stage')) {
        newElement.isPlanningTableCollapsed = isPlanningTableCollapsed(oldBusinessObject);
      }

      if (is(newDefinition, 'cmmn:Stage')) {
        newElement.autoComplete = isAutoComplete(oldBusinessObject);
      }

    }

    if (!newBusinessObject) {
      newBusinessObject = cmmnFactory.create(type);
    }

    newElement.businessObject = newBusinessObject;

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

    if (!is(newDefinition, 'cmmn:EventListener')) {
      
      var defaultControl = replacePlanItemControl(definition.defaultControl, newDefinition);

      setParent(defaultControl, newDefinition);
      newDefinition.defaultControl = defaultControl;

    }

    if (is(newDefinition, 'cmmn:Task')) {
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

    if (!is(getDefinition(newItem), 'cmmn:EventListener')) {
      
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
      if (manualActivationRule && (!element || cmmnRules.canSetManualActivationRuleRule(element))) {

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
