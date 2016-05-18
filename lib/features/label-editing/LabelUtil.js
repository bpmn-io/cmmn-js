'use strict';

var is = require('../../util/ModelUtil').is;
var isAny = require('../modeling/util/ModelingUtil').isAny;

var getBusinessObject = require('../../util/ModelUtil').getBusinessObject;

function getLabelAttr(element) {
  if (is(element, 'cmmn:TextAnnotation')) {
    return 'text';
  }

  return 'name';
}

function getSemantic(element) {
  var bo = getBusinessObject(element);

  if (is(bo, 'cmmndi:CMMNEdge') && bo.cmmnElementRef) {
    bo = bo.cmmnElementRef;
  }

  return bo;
}

/**
 * Check if the given element is of a type which has a reference to a definition.
 * This could be either plan items or discretionary items or case file items.
 *
 * @param {djs.model.Base} element
 *
 * @return {Boolean}
 */
var isReferencing = function(element) {
  return isAny(element, [
    'cmmn:PlanItem',
    'cmmn:DiscretionaryItem',
    'cmmn:CaseFileItem'
  ]);
};

function hasEditableLabel(element) {
  return !isAny(element, [
    'cmmn:Association',
    'cmmn:Criterion',
    'cmmndi:CMMNEdge'
  ]);
}

var getLabel = function(element) {

  var semantic = getSemantic(element),
      attr = getLabelAttr(semantic);

  if (!hasEditableLabel(semantic)) {
    return;
  }

  // Get definition as semantic if
  // * the element has no name property set
  // * the element type has a reference to a definition
  if (!semantic[attr] && isReferencing(element)) {
    semantic = semantic.definitionRef;
  }

  return semantic[attr] || '';
};

module.exports.getLabel = getLabel;


var setLabel = function(element, text, isExternal, isExclusiveRef) {

  var semantic = getSemantic(element),
      attr = getLabelAttr(semantic);

  // Get definition as semantic if
  // * the element has no name property set
  // * the element type has a reference to a definition
  // * the element is the only reference to a defition
  if (!semantic[attr] && isReferencing(element) && isExclusiveRef) {
    semantic = semantic.definitionRef;
  }

  semantic[attr] = text;

  // show external label if not empty
  if (isExternal) {
    element.hidden = !text;
  }

  return element;
};

module.exports.setLabel = setLabel;
