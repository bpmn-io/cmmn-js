'use strict';

/**
 * Is an element of the given CMMN type?
 *
 * @param  {djs.model.Base|ModdleElement} element
 * @param  {String} type
 *
 * @return {Boolean}
 */
function is(element, type) {
  var bo = getBusinessObject(element);

  return !!(bo && ((typeof bo.$instanceOf === 'function') && bo.$instanceOf(type)));
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
  return getBusinessObject(element).definitionRef;
}

module.exports.getDefinition = getDefinition;

function getControl(element) {
  element = getBusinessObject(element);

  var itemControl = element.itemControl;
  if (itemControl) {
    return itemControl;
  }

  var definition = getDefinition(element);
  return (definition || {}).defaultControl;
}

module.exports.getControl = getControl;

function isRequired(element) {
  var control = getControl(element);
  return control && control.requiredRule;
}

module.exports.isRequired = isRequired;

function isRepeatable(element) {
  var control = getControl(element);
  return control && control.repetitionRule;
}

module.exports.isRepeatable = isRepeatable;

function isManualActivation(element) {
  var control = getControl(element);
  return control && control.manualActivationRule;
}

module.exports.isManualActivation = isManualActivation;

function isAutoComplete(element) {
  element = getBusinessObject(element);
  return element.autoComplete || (getDefinition(element) && getDefinition(element).autoComplete);
}

module.exports.isAutoComplete = isAutoComplete;

function hasPlanningTable(element) {
  element = getBusinessObject(element);
  return element.planningTable || (getDefinition(element) && getDefinition(element).planningTable);
}

module.exports.hasPlanningTable = hasPlanningTable;

function getName(element) {
  element = getBusinessObject(element);

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
  return getBusinessObject(element).sentryRef;
}

module.exports.getSentry = getSentry;
