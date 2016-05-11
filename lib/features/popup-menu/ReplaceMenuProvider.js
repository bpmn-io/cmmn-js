'use strict';

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter');

var replaceOptions = require('../replace/ReplaceOptions');

var isItemCapable = require('../modeling/util/PlanItemDefinitionUtil').isItemCapable;

var getBusinessObject = require('../../util/ModelUtil').getBusinessObject,
    getDefinition = require('../../util/ModelUtil').getDefinition,
    isCasePlanModel = require('../../util/ModelUtil').isCasePlanModel,
    isRequired = require('../../util/ModelUtil').isRequired,
    isRepeatable = require('../../util/ModelUtil').isRepeatable,
    isManualActivation = require('../../util/ModelUtil').isManualActivation,
    is = require('../../util/ModelUtil').is;


/**
 * Returns true, if an element is from a different type
 * than a target definition. Takes into account the type,
 * event definition type and triggeredByEvent property.
 *
 * @param {djs.model.Base} element
 *
 * @return {Boolean}
 */
function isDifferentType(element) {

  return function(entry) {
    var target = entry.target;

    var businessObject = getBusinessObject(element);

    if (businessObject.$type !== target.type) {
      return true;
    }

    if (isItemCapable(element)) {
      return businessObject.get('definitionRef').$type !== target.definitionType;
    }

    return false;
  };
}


/**
 * This module is an element agnostic replace menu provider for the popup menu.
 */
function ReplaceMenuProvider(popupMenu, cmmnReplace, cmmnFactory, modeling, rules) {

  this._popupMenu = popupMenu;
  this._cmmnReplace = cmmnReplace;
  this._cmmnFactory = cmmnFactory;
  this._modeling = modeling;
  this._rules = rules;

  this.register();
}

ReplaceMenuProvider.$inject = [ 'popupMenu', 'cmmnReplace', 'cmmnFactory', 'modeling', 'rules' ];


/**
 * Register replace menu provider in the popup menu
 */
ReplaceMenuProvider.prototype.register = function() {
  this._popupMenu.registerProvider('cmmn-replace', this);
};


/**
 * Get all entries from replaceOptions for the given element and apply filters
 * on them. Get for example only elements, which are different from the current one.
 *
 * @param {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu entry items
 */
ReplaceMenuProvider.prototype.getEntries = function(element) {

  var rules = this._rules;

  var entries,
      differentType = isDifferentType(element),
      definition = getDefinition(element);
  

  if (!rules.allowed('shape.replace', { element: element })) {
    return [];
  }

  if (is(definition, 'cmmn:Task')) {

    var parent = element.parent;

    entries = filter(replaceOptions.TASK, function(entry) {

      var target = entry.target,
          type = target.type,
          definitionType = target.definitionType;

      if (is(element, 'cmmn:PlanItem')) {
        if (type === 'cmmn:DiscretionaryItem' && !is(getDefinition(parent), 'cmmn:Stage')) {
          return false;
        }
      }

      if (definitionType === 'cmmn:HumanTask') {
        var isBlocking = target.isBlocking;
        if (definition.isBlocking !== isBlocking) {
          return false;
        }
      }

      return differentType(entry);

    });

    return this._createEntries(element, entries);

  }


  if (is(definition, 'cmmn:EventListener')) {

    entries = filter(replaceOptions.EVENT_LISTENER, differentType);
    return this._createEntries(element, entries);

  }


  if (is(element, 'cmmn:Criterion')) {

    entries = filter(replaceOptions.CRITERION, differentType);
    return this._createEntries(element, entries);

  }


  return [];

};


ReplaceMenuProvider.prototype.getHeaderEntries = function(element) {

  var headerEntries = [],
      definition = getDefinition(element);

  if (is(definition, 'cmmn:Task')) {
    headerEntries = headerEntries.concat(this._getBlockingEntry(element));
  }

  if (is(definition, 'cmmn:Stage')) {
    headerEntries = headerEntries.concat(this._getAutoCompleteEntry(element));
  }

  if (ensureSupportRules(element)) {
    headerEntries = headerEntries.concat(this._getRuleEntries(element));
  }

  return headerEntries;

};

/**
 * Creates an array of menu entry objects for a given element and filters the replaceOptions
 * according to a filter function.
 *
 * @param  {djs.model.Base} element
 * @param  {Object} replaceOptions
 *
 * @return {Array<Object>} a list of menu items
 */
ReplaceMenuProvider.prototype._createEntries = function(element, replaceOptions) {
  var menuEntries = [];

  var self = this;

  forEach(replaceOptions, function(definition) {
    var entry = self._createMenuEntry(definition, element);

    menuEntries.push(entry);
  });

  return menuEntries;
};


/**
 * Creates and returns a single menu entry item.
 *
 * @param  {Object} definition a single replace options definition object
 * @param  {djs.model.Base} element
 * @param  {Function} [action] an action callback function which gets called when
 *                             the menu entry is being triggered.
 *
 * @return {Object} menu entry item
 */
ReplaceMenuProvider.prototype._createMenuEntry = function(definition, element, action) {

  var replaceElement = this._cmmnReplace.replaceElement;

  var replaceAction = function() {
    return replaceElement(element, definition.target);
  };

  action = action || replaceAction;

  var menuEntry = {
    label: definition.label,
    className: definition.className,
    id: definition.actionName,
    action: action
  };

  return menuEntry;
};


ReplaceMenuProvider.prototype._getBlockingEntry = function(element) {

  var self = this;

  var definition = getDefinition(element);

  function toggleBlockingEntry(event, entry) {
    var blocking = !entry.active;
    self._modeling.updateControls(element, { isBlocking: blocking });
  }

  var isBlocking = definition.isBlocking;
  var entries = [
    {
      id: 'toggle-is-blocking',
      className: 'cmmn-icon-blocking',
      title: 'Blocking',
      active: isBlocking,
      action: toggleBlockingEntry
    }
  ];

  return entries;
};


ReplaceMenuProvider.prototype._getAutoCompleteEntry = function(element) {

  var self = this;

  var definition = getDefinition(element);

  function toggleAutoCompleteEntry(event, entry) {
    var autoComplete = !entry.active;
    self._modeling.updateControls(element, { autoComplete: autoComplete });
  }

  var isAutoComplete = definition.autoComplete;
  var entries = [
    {
      id: 'toggle-auto-complete',
      className: 'cmmn-icon-auto-complete-marker',
      title: 'Auto Complete',
      active: isAutoComplete,
      action: toggleAutoCompleteEntry
    }
  ];

  return entries;
};


ReplaceMenuProvider.prototype._getRuleEntries = function(element) {

  var self = this;

  var definition = getDefinition(element);

  function toggleControlEntry(control, type) {

    return function(event, entry) {

      var value = {};

      if (entry.active) {
        value[control] = undefined;
      }
      else {
        value[control] = self._cmmnFactory.create(type);
      }

      self._modeling.updateControls(element, value);
    };

  }

  var repeatable = isRepeatable(element),
      required = isRequired(element),
      manualActivation = isManualActivation(element);

  var entries = [
    {
      id: 'toggle-required-rule',
      className: 'cmmn-icon-required-marker',
      title: 'Required Rule',
      active: required,
      action: toggleControlEntry('requiredRule', 'cmmn:RequiredRule')
    }
  ];

  if (!is(definition, 'cmmn:Milestone')) {

    entries.push({
      id: 'toggle-manual-activation-rule',
      className: 'cmmn-icon-manual-activation-marker',
      title: 'Manual Activation Rule',
      active: manualActivation,
      action: toggleControlEntry('manualActivationRule', 'cmmn:ManualActivationRule')
    });

  }

  entries.push({
    id: 'toggle-repetition-rule',
    className: 'cmmn-icon-repetition-marker',
    title: 'Repetition Rule',
    active: repeatable,
    action: toggleControlEntry('repetitionRule', 'cmmn:RepetitionRule')
  });

  return entries;
};

module.exports = ReplaceMenuProvider;


function ensureSupportRules(element) {

  if (isCasePlanModel(element)) {
    return false;
  }

  if (is(element, 'cmmn:Criterion')) {
    return false;
  }

  var definition = getDefinition(element);

  if (is(definition, 'cmmn:EventListener')) {
    return false;
  }

  if (!is(definition, 'cmmn:Stage') && is(definition, 'cmmn:PlanFragment')) {
    return false;
  }

  return true;

}
