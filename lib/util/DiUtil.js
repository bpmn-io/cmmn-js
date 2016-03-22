'use strict';

var is = require('./ModelUtil').is,
    getBusinessObject = require('./ModelUtil').getBusinessObject,
    isCasePlanModel = require('./ModelUtil').isCasePlanModel;

module.exports.isCollapsed = function(element) {

  if (!isCasePlanModel(element)) {

    element = getBusinessObject(element);

    var isStage = is(element, 'cmmn:Stage');

    if (!isStage && element.definitionRef) {
      isStage = is(element.definitionRef, 'cmmn:Stage');
    }

    if (isStage || is(element, 'cmmn:PlanFragment')) {
      return !!(element && element.di && element.di.isCollapsed);
    }
  }

  return false;
};

module.exports.isPlanningTableCollapsed = function (element) {

  element = getBusinessObject(element);

  if (is(element, 'cmmn:Stage') ||
     (element.definitionRef && (is(element.definitionRef, 'cmmn:Stage') ||
      is(element.definitionRef, 'cmmn:HumanTask')))) {
    return element.di && element.di.isPlanningTableCollapsed;
  }

  return false;
};

module.exports.isStandardEventVisible = function (element) {
  element = getBusinessObject(element);
  return is(element, 'cmmn:OnPart') && element.di && element.di.isStandardEventVisible;
};