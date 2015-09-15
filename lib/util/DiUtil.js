'use strict';

var is = require('./ModelUtil').is,
    getBusinessObject = require('./ModelUtil').getBusinessObject;

module.exports.isCollapsed = function(element) {

  element = getBusinessObject(element);

  var type = 'cmmn:Stage';
  var isStage = is(element, type);

  if (!isStage && element.definitionRef) {
    isStage = is(element.definitionRef, type);
  }

  if (isStage || is(element, 'cmmn:PlanFragment')) {
    return element && element.di && element.di.isCollapsed;
  }

  return true;
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