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

/**
 * Check if the given element is of a type which has a reference to a definition.
 * This could be either plan items or discretionary items or case file items.
 *
 * @param {djs.model.Base} element
 *
 * @return {Boolean}
 */
var isReferencing = function(element) {
  return (
    is(element, 'cmmn:PlanItem') ||
    is(element, 'cmmn:DiscretionaryItem') ||
    is(element, 'cmmn:CaseFileItem')
  );
};


var getLabel = function(element) {

  // don't get labels for criterions and edges
  if (isAny(element, [ 'cmmn:Criterion', 'cmmndi:CMMNEdge', 'cmmn:Association' ])) {
    return;
  }

  var semantic = getBusinessObject(element),
      attr = getLabelAttr(semantic);

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

  var semantic = getBusinessObject(element),
      attr = getLabelAttr(semantic);

  // Get definition as semantic if
  // * the element has no name property set
  // * the element type has a reference to a definition
  // * the element is the only reference to a defition
  if (!semantic[attr] && isReferencing(element) && isExclusiveRef(element)) {
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
