'use strict';

var getOrientation = require('diagram-js/lib/layout/LayoutUtil').getOrientation;

var is = require('../../util/ModelUtil').is,
    getDefinition = require('../../util/ModelUtil').getDefinition;


/**
 * Get orientation of the given position rectangle in relation to the
 * given target rectangle. When the position is near a corner (respecting
 * the given offet) the string 'corner' is returned.
 *
 * A padding (positive or negative) may be passed to influence
 * horizontal / vertical orientation and intersection.
 *
 * @param {Bounds} position
 * @param {Bounds} target
 * @param {Point|Number} padding
 * @param {Number} offset
 */
function getCornerlessOrientation(position, target, padding, offset) {

  // don't snap to top left corner
  if (position.x - offset < target.x &&
      position.y - offset < target.y) {
    return 'corner';
  }

  // don't snap to top right corner
  if (position.x + offset > target.x + target.width &&
      position.y - offset < target.y) {
    return 'corner';
  }

  // don't snap to bottom left corner
  if (position.x - offset < target.x &&
      position.y + offset > target.y + target.height) {
    return 'corner';
  }

  // don't snap to bottom right corner
  if (position.x + offset > target.x + target.width &&
      position.y + offset > target.y + target.height) {
    return 'corner';
  }

  return getOrientation(position, target, padding);
}


function getCriterionAttachment(position, target) {

  var orientation;

  var definition = getDefinition(target);

  if (is(target, 'cmmn:PlanItem') && is(definition, 'cmmn:Stage')) {
    orientation = getCornerlessOrientation(position, target, -15, 20);

  } else
  if (is(definition, 'cmmn:Milestone')) {
    orientation = getCornerlessOrientation(position, target, -3, 7);

  } else {
    orientation = getOrientation(position, target, -15);
  }

  if (orientation !== 'intersect') {
    return orientation;
  } else {
    return null;
  }
}

module.exports.getCriterionAttachment = getCriterionAttachment;