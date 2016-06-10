'use strict';

function isInstanceOf(bo, type) {
  return !!(bo && ((typeof bo.$instanceOf === 'function') && bo.$instanceOf(type)));
}

/**
 * Is an element of the given CMMN type?
 *
 * @param  {djs.model.Base|ModdleElement} element
 * @param  {String} type
 *
 * @return {Boolean}
 */
function is(element, type) {
  return isInstanceOf(getBusinessObject(element), type);
}

module.exports.is = is;


/**
 * Return the business object for a given element.
 *
 * @param  {djs.model.Base|ModdleElement} element
 *
 * @return {ModdleElement}
 */
function getBusinessObject(element) {
  return element && element.businessObject ? element.businessObject : element;
}

module.exports.getBusinessObject = getBusinessObject;

function isCasePlanModel(element) {
  element = getBusinessObject(element);
  return is(element, 'cmmn:Stage') && element.$parent && is(element.$parent, 'cmmn:Case');
}

module.exports.isCasePlanModel = isCasePlanModel;

function getDefinition(element) {
  var bo = getBusinessObject(element);

  if (is(element, 'cmmn:PlanItemDefinition') || is(element, 'cmmn:CaseFileItemDefinition')) {
    return bo;
  }

  return bo && bo.definitionRef;
}

module.exports.getDefinition = getDefinition;

function getDefaultControl(element) {
  var definition = getDefinition(element);
  return definition && definition.defaultControl;
}

module.exports.getDefaultControl = getDefaultControl;

function getItemControl(element) {
  element = getBusinessObject(element);
  return element && element.itemControl;
}

module.exports.getItemControl = getItemControl;


function getRule(element, rule) {
  var itemControl = getItemControl(element),
      defaultControl = getDefaultControl(element);

  if (itemControl && itemControl[rule]) {
    return itemControl[rule];
  }

  return defaultControl && defaultControl[rule];
}

function isRequired(element) {
  return !!getRule(element, 'requiredRule');
}

module.exports.isRequired = isRequired;

function isRepeatable(element) {
  return !!getRule(element, 'repetitionRule');
}

module.exports.isRepeatable = isRepeatable;

function isManualActivation(element) {
  return !!getRule(element, 'manualActivationRule');
}

module.exports.isManualActivation = isManualActivation;

function isAutoComplete(element) {
  element = getBusinessObject(element);
  var definition = getDefinition(element);
  return element.autoComplete || (definition && definition.autoComplete);
}

module.exports.isAutoComplete = isAutoComplete;

function hasPlanningTable(element) {
  element = getBusinessObject(element);
  return element.planningTable || (getDefinition(element) && getDefinition(element).planningTable);
}

module.exports.hasPlanningTable = hasPlanningTable;

function getName(element) {
  element = getBusinessObject(element);

  if (is(element, 'cmmndi:CMMNEdge') && element.cmmnElementRef) {
    element = element.cmmnElementRef;
  }

  var name = element.name;
  if (!name) {

    if (element.definitionRef) {
      name = element.definitionRef.name;
    }
  }

  return name;
}

module.exports.getName = getName;


/**
 * Returns the referenced sentry, if present.
 *
 * @param {djs.model.Base} criterion
 *
 * @result {ModdleElement} referenced sentry
 */
function getSentry(element) {
  var bo = getBusinessObject(element);

  if (is(bo, 'cmmn:Sentry')) {
    return bo;
  }

  return bo && bo.sentryRef;
}

module.exports.getSentry = getSentry;


function getStandardEvent(element) {
  element = getBusinessObject(element);
  return element.cmmnElementRef && element.cmmnElementRef.standardEvent;
}

module.exports.getStandardEvent = getStandardEvent;

function getStandardEvents(element) {

  if (is(element, 'cmmndi:CMMNEdge')) {
    element = getBusinessObject(element).cmmnElementRef;
  }

  if (is(element, 'cmmn:OnPart')) {

    if (is(element.exitCriterionRef, 'cmmn:ExitCriterion')) {
      return [ 'exit' ];
    }

    return getTransitions(element.sourceRef);

  }

  return [];

}

module.exports.getStandardEvents = getStandardEvents;


function getTransitions(element) {

  element = getBusinessObject(element);

  if (is(element, 'cmmn:CaseFileItem')) {

    return [
      'addChild',
      'addReference',
      'create',
      'delete',
      'removeChild',
      'removeReference',
      'replace',
      'update'
    ];

  }

  if (is(element, 'cmmn:PlanItem') || is(element, 'cmmn:DiscretionaryItem')) {

    var definition = getDefinition(element);

    if (is(definition, 'cmmn:EventListener') || is(definition, 'cmmn:Milestone')) {

      return [
        'create',
        'occur',
        'resume',
        'suspend',
        'terminate'
      ];

    }

    return [
      'complete',
      'create',
      'disable',
      'enable',
      'exit',
      'fault',
      'manualStart',
      'parentResume',
      'parentSuspend',
      'reactivate',
      'reenable',
      'resume',
      'start',
      'suspend',
      'terminate'
    ];

  }

  if (isCasePlanModel(element)) {

    return [
      'close',
      'complete',
      'create',
      'fault',
      'reactivate',
      'suspend',
      'terminate'
    ];

  }

  return [];

}

module.exports.getTransitions = getTransitions;