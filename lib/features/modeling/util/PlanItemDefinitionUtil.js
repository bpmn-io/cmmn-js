'use strict';

var ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    getDefinition = ModelUtil.getDefinition,
    getBusinessObject = ModelUtil.getBusinessObject;

var isAny = require('./ModelingUtil').isAny,
    getParent = require('./ModelingUtil').getParent;

var eachElement = require('diagram-js/lib/util/Elements').eachElement;


/**
 * Returns all contained discretionary items.
 *
 * @param {ModdleElement} element
 *
 * @return {Array<ModdleElement>} all discretionary items
 */
function getAllDiscretionaryItems(element) {

  element = getBusinessObject(element);

  if (isItemCapable(element)) {
    element = getDefinition(element);
  }

  var result = [];

  if (isPlanningTableCapable(element)) {
    element = element.planningTable;

    if (element) {

      var items = element.get('tableItems');
      eachElement(items, function(item) {
        if (isDiscretionaryItem(item)) {
          result.push(item);
        }
        else {
          return item.get('tableItems');
        }
      });
    }
  }

  return result;
}

module.exports.getAllDiscretionaryItems = getAllDiscretionaryItems;


/**
 * Returns all directed item capables elements of the given element.
 *
 * @param {ModdleElement} element
 *
 * @return {Array<ModdleElement>} all direct item capables
 */
function getDirectItemCapables(element) {

  element = getBusinessObject(element);

  if (isItemCapable(element)) {
    element = getDefinition(element);
  }

  var result = [];

  function add(item) {
    result.push(item);
  }

  if (element) {

    var items;

    if (is(element, 'cmmn:PlanFragment')) {
      items = element.get('planItems');
      eachElement(items, add);
    }

    if (isPlanningTableCapable(element)) {
      items = getAllDiscretionaryItems(element);
      eachElement(items, add);
    }

  }

  return result;
}

module.exports.getDirectItemCapables = getDirectItemCapables;


/**
 * Returns true if the given element is either a discretionary item
 * or a plan item
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is a discretionary item or a plan item
 */
function isItemCapable(element) {
  return isAny(element, [ 'cmmn:DiscretionaryItem', 'cmmn:PlanItem' ]);
}

module.exports.isItemCapable = isItemCapable;


/**
 * Returns true if the given element is either a human task or
 * a stage.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is a human task or stage
 */
function isPlanningTableCapable(element) {
  return isAny(element, [ 'cmmn:HumanTask', 'cmmn:Stage' ]);
}

module.exports.isPlanningTableCapable = isPlanningTableCapable;


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

module.exports.isDiscretionaryItem = isDiscretionaryItem;


/**
 * Returns true if the given element is a discretionary to a human task.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is discretionary to a human task
 */
function isDiscretionaryToHumanTask(element) {
  var bo = getBusinessObject(element);
  var parent = getParent(bo, 'cmmn:PlanItemDefinition');
  return is(parent, 'cmmn:HumanTask');
}

module.exports.isDiscretionaryToHumanTask = isDiscretionaryToHumanTask;


/**
 * Returns true if the given element is a human task.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is a human task
 */
function isHumanTask(element) {
  return is(element, 'cmmn:HumanTask');
}

module.exports.isHumanTask = isHumanTask;


/**
 * Returns true if the given element is a plan fragment and not
 * a stage.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} when it is a plan fragment
 */
function isPlanFragment(element) {
  return is(element, 'cmmn:PlanFragment') && !is(element, 'cmmn:Stage');
}

module.exports.isPlanFragment = isPlanFragment;
