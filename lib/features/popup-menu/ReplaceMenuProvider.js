'use strict';

var forEach = require('min-dash').forEach,
    filter = require('min-dash').filter;

var replaceOptions = require('../replace/ReplaceOptions');

var isItemCapable = require('../modeling/util/PlanItemDefinitionUtil').isItemCapable;

var isAny = require('../modeling/util/ModelingUtil').isAny;

var ModelUtil = require('../../util/ModelUtil'),
    getBusinessObject = ModelUtil.getBusinessObject,
    getDefinition = ModelUtil.getDefinition,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    isRequired = ModelUtil.isRequired,
    isRepeatable = ModelUtil.isRepeatable,
    isManualActivation = ModelUtil.isManualActivation,
    is = ModelUtil.is;

var isCollapsed = require('../../util/DiUtil').isCollapsed;


/**
 * Returns true, if an element is from a different type.
 * discretionary / non discretionary
 *
 * @param {djs.model.Base} element
 * @param {Object} entry
 *
 * @return {Boolean}
 */
function isDifferentType(element, entry) {

  var businessObject = getBusinessObject(element);

  return businessObject.$type !== entry.target.type;
}


/**
 * Returns true if the definition type is different.
 * e.g. process task / human task
 *
 * @param {djs.model.Base} element
 * @param {Object} entry
 *
 * @return {Boolean}
 */
function isDifferentDefinitionType(element, entry) {

  return getDefinition(element).$type !== entry.target.definitionType;
}


function canReplaceElementByTarget(element, target) {

  var type = target.type,
      definitionType = target.definitionType,
      parent = element.parent,
      definition = getDefinition(element);

  if (isPlanItem(element)) {
    if (type === 'cmmn:DiscretionaryItem' && !isStage(parent)) {
      return false;
    }
  }

  if (definitionType === 'cmmn:HumanTask') {

    if (isPlanFragment(element) && !target.isBlocking) {
      return false;
    }

    if (isTask(element) && definition.isBlocking !== target.isBlocking) {
      return false;
    }

  }

  return true;

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
      definition = getDefinition(element);


  if (!rules.allowed('shape.replace', { element: element })) {
    return [];
  }


  if (isItemCapable(element)) {

    if (isTask(element)) {

      entries = filter(replaceOptions.TASK, function(entry) {

        var target = entry.target;

        if (canReplaceElementByTarget(element, target)) {

          // ^ === XOR
          // returns true if and only of EITHER the type OR the definition type is different
          return isDifferentType(element, entry) ^ isDifferentDefinitionType(element, entry);
        }
      });

      return this._createEntries(element, entries);
    }

    if (isPlanFragment(element)) {

      if (!isCollapsed(element)) {

        entries = filter(replaceOptions.PLAN_FRAGMENT_EXPANDED, function(entry) {

          var target = entry.target;

          if (canReplaceElementByTarget(element, target)) {

            // returns true if the type or the definition type is different (or both)
            return isDifferentType(element, entry) || isDifferentDefinitionType(element, entry);
          }
        });

        return this._createEntries(element, entries);
      }

      if (isCollapsed(element)) {

        entries = filter(replaceOptions.TASK, function(entry) {

          var target = entry.target,
              definitionType = target.definitionType;

          if (!canReplaceElementByTarget(element, target)) {
            return false;
          }

          if (definitionType === definition.$type && !target.isCollapsed) {
            return true;
          }

          // ^ === XOR
          // returns true if and only of EITHER the type OR the definition type is different
          return isDifferentType(element, entry) ^ isDifferentDefinitionType(element, entry);

        });

        return this._createEntries(element, entries);

      }

    }

    if (isEventListener(element)) {

      entries = filter(replaceOptions.EVENT_LISTENER, function(entry) {
        return isDifferentDefinitionType(element, entry);
      });

      return this._createEntries(element, entries);
    }

  }


  if (isCriterion(element)) {

    entries = filter(replaceOptions.CRITERION, function(entry) {
      return isDifferentType(element, entry);
    });

    return this._createEntries(element, entries);
  }

  return [];

};


ReplaceMenuProvider.prototype.getHeaderEntries = function(element) {

  var headerEntries = [];

  if (isTask(element)) {
    headerEntries = headerEntries.concat(this._getBlockingEntry(element));
  }

  if (isStage(element)) {
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

  if (!isMilestone(element)) {

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

  var definition = getDefinition(element);

  return !isCasePlanModel(element) && isAny(definition, [
    'cmmn:Stage',
    'cmmn:Milestone',
    'cmmn:Task'
  ]);
}

function isPlanFragment(element) {
  return is(getDefinition(element), 'cmmn:PlanFragment');
}

function isStage(element) {
  return is(getDefinition(element), 'cmmn:Stage');
}

function isEventListener(element) {
  return is(getDefinition(element), 'cmmn:EventListener');
}

function isMilestone(element) {
  return is(getDefinition(element), 'cmmn:Milestone');
}

function isTask(element) {
  return is(getDefinition(element), 'cmmn:Task');
}

function isCriterion(element) {
  return is(element, 'cmmn:Criterion');
}

function isPlanItem(element) {
  return is(element, 'cmmn:PlanItem');
}
