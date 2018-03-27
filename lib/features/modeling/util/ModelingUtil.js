'use strict';

var some = require('min-dash').some;

var ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    getBusinessObject = ModelUtil.getBusinessObject;

var Model = require('diagram-js/lib/model');

/**
 * Return true if given elements are the same.
 *
 * @param {Object} a
 * @param {Object} b
 *
 * @return {boolean}
 */
function isSame(a, b) {
  return a === b;
}

module.exports.isSame = isSame;


/**
 * Return true if given cases are the same.
 *
 * @param {ModdleElement} a
 * @param {ModdleElement} b
 *
 * @return {boolean}
 */
function isSameCase(a, b) {
  return isSame(getCase(a), getCase(b));
}

module.exports.isSameCase = isSameCase;

function getCase(element) {
  return getParent(getBusinessObject(element), 'cmmn:Case');
}

module.exports.getCase = getCase;


/**
 * Return the parents of the element with any of the given types.
 *
 * @param {ModdleElement} element
 * @param {String|Array<String>} anyType
 *
 * @return {Array<ModdleElement>}
 */
function getParents(element, anyType) {

  var parents = [];

  if (typeof anyType === 'string') {
    anyType = [ anyType ];
  }

  while (element) {
    element = element.$parent || element.parent;

    if (element) {

      if (anyType) {
        if (isAny(element, anyType)) {
          parents.push(element);
        }
      }
      else {
        parents.push(element);
      }

    }

  }

  return parents;
}

module.exports.getParents = getParents;

/**
 * Return the parent of the element with any of the given types.
 *
 * @param {ModdleElement} element
 * @param {String|Array<String>} anyType
 *
 * @return {ModdleElement}
 */
function getParent(element, anyType) {

  if (typeof anyType === 'string') {
    anyType = [ anyType ];
  }

  while ((element = element.$parent || element.parent)) {
    if (anyType) {
      if (isAny(element, anyType)) {
        return element;
      }
    }
    else {
      return element;
    }
  }

  return null;
}

module.exports.getParent = getParent;


/**
 * Return true if element has any of the given types.
 *
 * @param {djs.model.Base} element
 * @param {Array<String>} types
 *
 * @return {Boolean}
 */
function isAny(element, types) {
  return some(types, function(t) {
    return is(element, t);
  });
}

module.exports.isAny = isAny;


function isLabel(element) {
  return element instanceof Model.Label;
}

module.exports.isLabel = isLabel;