'use strict';

var filter = require('min-dash').filter,
    forEach = require('min-dash').forEach;

var getBusinessObject = require('../../../util/ModelUtil').getBusinessObject,
    getItemControl = require('../../../util/ModelUtil').getItemControl,
    getDefaultControl = require('../../../util/ModelUtil').getDefaultControl,
    getDefinition = require('../../../util/ModelUtil').getDefinition,
    hasPlanningTable = require('../../../util/ModelUtil').hasPlanningTable;

var isPlanningTableCapable = require('../util/PlanItemDefinitionUtil').isPlanningTableCapable;


function UpdateControlsHandler(itemRegistry, modeling, cmmnReplace, cmmnFactory) {
  this._itemRegistry = itemRegistry;
  this._modeling = modeling;
  this._cmmnReplace = cmmnReplace;
  this._cmmnFactory = cmmnFactory;
}

UpdateControlsHandler.$inject = [ 'itemRegistry', 'modeling', 'cmmnReplace', 'cmmnFactory' ];

module.exports = UpdateControlsHandler;


var PLAN_ITEM_CONTROL_PROPS = [
  'requiredRule',
  'repetitionRule',
  'manualActivationRule'
];

function getUpdate(key, value) {
  var update = {};
  update[key] = value;
  return update;
}


UpdateControlsHandler.prototype.preExecute = function(context) {

  var self = this;

  var element = context.element,
      values = context.values;

  if (!element) {
    throw new Error('element required');
  }

  forEach(values, function(value, key) {

    if (PLAN_ITEM_CONTROL_PROPS.indexOf(key) !== -1) {
      self._updateRule(element, key, value);
    }
    else {
      self._updateDecorator(element, key, value);
    }

  });

};


UpdateControlsHandler.prototype.execute = function() {};

UpdateControlsHandler.prototype.revert = function() {};


// API ////////////////////////////////////////////////


UpdateControlsHandler.prototype._updateDecorator = function(element, key, value) {

  var self = this,
      modeling = self._modeling;

  var definition = getDefinition(element),
      update = getUpdate(key, value),
      changed = [];

  if (definition[key] !== value) {

    changed = self._getReferencingShapes(definition);

    if (changed.length > 1 && canReplaceDefinition(definition)) {
      definition = self._replaceDefinition(element);
      changed = element;
    }

    modeling.updateProperties(definition, update, changed);

  }

};


UpdateControlsHandler.prototype._updateRule = function(element, rule, value) {

  var self = this,
      modeling = self._modeling,
      cmmnFactory = self._cmmnFactory;

  var itemControl = getItemControl(element),
      defaultControl = getDefaultControl(element),
      definition = getDefinition(element),
      update = getUpdate(rule, value);


  !value ? deleteRule() : setRule();


  function deleteRule() {

    var oldValue;

    if (isRulePresent(itemControl, rule)) {
      oldValue = itemControl[rule];
      modeling.updateProperties(itemControl, update, element);
      modeling.updateSemanticParent(oldValue);

      if (canDeletePlanItemControl(itemControl)) {
        modeling.updateProperties(element, { itemControl: undefined });
        modeling.updateSemanticParent(itemControl);
      }

    }

    if (isRulePresent(defaultControl, rule)) {
      oldValue = defaultControl[rule];

      var changed = self._getReferencingShapes(definition);

      if (changed.length > 1 && canReplaceDefinition(definition)) {

        changed = filter(changed, function(elem) {
          var localItemControl = getItemControl(elem),
              localDefaultControl = getDefaultControl(elem);

          return !isRulePresent(localItemControl, rule) &&
                  isRulePresent(localDefaultControl, rule);
        });

        if (changed.length > 1) {
          self._replaceDefinition(element);
          defaultControl = getDefaultControl(element);
          changed = element;
        }

      }

      modeling.updateProperties(defaultControl, update, changed);
      modeling.updateSemanticParent(oldValue);

      if (canDeletePlanItemControl(defaultControl)) {
        modeling.updateProperties(definition, { defaultControl: undefined }, changed);
        modeling.updateSemanticParent(defaultControl);
      }

    }

  }

  function setRule() {

    if (!itemControl) {
      itemControl = createPlanItemControl();
      modeling.updateProperties(element, { itemControl: itemControl });
      modeling.updateSemanticParent(itemControl, getBusinessObject(element));
    }

    modeling.updateProperties(itemControl, update, element);
    modeling.updateSemanticParent(value, itemControl);
  }

  function isRulePresent(control, rule) {
    return control && control[rule];
  }

  function createPlanItemControl() {
    return cmmnFactory.create('cmmn:PlanItemControl');
  }

  function canDeletePlanItemControl(control) {
    return !!(control && !control.repetitionRule && !control.requiredRule && !control.manualActivationRule);
  }

};


UpdateControlsHandler.prototype._replaceDefinition = function(element) {

  var self = this,
      modeling = self._modeling,
      cmmnReplace = self._cmmnReplace;

  var definition = getDefinition(element);

  var newDefinition = cmmnReplace.replacePlanItemDefinition(definition);
  modeling.updateProperties(element, { definitionRef: newDefinition });

  modeling.updateSemanticParent(newDefinition, definition.$parent, 'planItemDefinitions');

  return newDefinition;

};


UpdateControlsHandler.prototype._getReferencingShapes = function(definition) {

  var self = this,
      itemRegistry = self._itemRegistry;

  return itemRegistry.getShapes(definition);

};


function canReplaceDefinition(definition) {
  return !(isPlanningTableCapable(definition) && hasPlanningTable(definition));
}