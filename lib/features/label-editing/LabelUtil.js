'use strict';

var is = require('../../util/ModelUtil').is;

var getBusinessObject = require('../../util/ModelUtil').getBusinessObject;


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
  if (is(element, 'cmmn:Criterion') || is(element, 'cmmndi:CMMNEdge')) {
    return;
  }

  var semantic = getBusinessObject(element);

  // Get definition as semantic if
  // * the element has no name property set
  // * the element type has a reference to a definition
  if (!semantic.name && isReferencing(element)) {
    semantic = semantic.definitionRef;
  }

  return semantic.name || '';
};

module.exports.getLabel = getLabel;


var setLabel = function(element, text, isExternal, isExclusiveRef) {

  var semantic = getBusinessObject(element);

  // Get definition as semantic if
  // * the element has no name property set
  // * the element type has a reference to a definition
  // * the element is the only reference to a defition
  if (!semantic.name && isReferencing(element) && isExclusiveRef(element)) {
    semantic = semantic.definitionRef;
  }

  semantic.name = text;

  // show external label if not empty
  if (isExternal) {
    element.hidden = !text;
  }

  return element;
};

module.exports.setLabel = setLabel;
