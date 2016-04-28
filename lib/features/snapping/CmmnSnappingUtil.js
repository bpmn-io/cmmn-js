
'use strict';

var getOrientation = require('diagram-js/lib/layout/LayoutUtil').getOrientation;


function getCriterionAttachment(position, targetBounds) {

  var orientation = getOrientation(position, targetBounds, -15);

  if (orientation !== 'intersect') {
    return orientation;
  } else {
    return null;
  }
}

module.exports.getCriterionAttachment = getCriterionAttachment;