'use strict';

var ModelUtil = require('../../../util/ModelUtil');

var is = ModelUtil.is,
    getBusinessObject = ModelUtil.getBusinessObject,
    isCasePlanModel = ModelUtil.isCasePlanModel;

var filter = require('min-dash').filter;
var ResizeUtil = require('diagram-js/lib/features/resize/ResizeUtil');
var getBBox = require('diagram-js/lib/util/Elements').getBBox;

var SLIGHTLY_HIGHER_PRIORITY = 1001;

var DEFAULT_MIN_WIDTH = 10;

/**
 * Computes the minimum resize box.
 *
 * Note: it is slightly different than
 * diagram-js/lib/features/resize/Resize#computeMinResizeBox
 */
function computeMinResizeBox(context) {
  var shape = context.shape,
      direction = context.direction,
      minDimensions,
      childrenBounds;

  minDimensions = context.minDimensions || {
    width: DEFAULT_MIN_WIDTH,
    height: DEFAULT_MIN_WIDTH
  };

  // get children bounds
  childrenBounds = computeChildrenBBox(shape, context.childrenBoxPadding);

  // get correct minimum bounds from given resize direction
  // basically ensures that the minBounds is max(childrenBounds, minDimensions)
  return ResizeUtil.getMinResizeBounds(direction, shape, minDimensions, childrenBounds);
}

/**
 * Computes the bbox of the children.
 *
 * It first determine all relevant children,
 * then it computes the size of the bbox.
 */
function computeChildrenBBox(shape, padding) {
  // grab all the children that are part of the
  // parents children box
  var elements = filter(shape.children, function(element) {
    return isBBoxChild(shape, element);
  });

  if (elements.length) {
    return ResizeUtil.addPadding(getBBox(elements), padding);
  }
}

/**
 * Returns true, if the given element does
 * have any waypoints, is not a label or an
 * exit criterian attached to the given shape.
 */
function isBBoxChild(shape, element) {

  // exclude connections
  if (element.waypoints) {
    return false;
  }

  // exclude labels
  if (element.type === 'label') {
    return false;
  }

  if (is(element, 'cmmn:ExitCriterion')) {
    var bo = getBusinessObject(shape);
    var exitCriteria = bo.get('exitCriteria');
    var exitCriterion = getBusinessObject(element);
    if (exitCriteria.indexOf(exitCriterion) >= 0) {
      return false;
    }
  }

  return true;
}

/**
 * Computes the minimum resize box by excluding
 * attached exit criteria to the case plan model.
 */
function ResizeCasePlanModelBehavior(eventBus, modeling) {

  eventBus.on('resize.start', SLIGHTLY_HIGHER_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape;

    if (isCasePlanModel(shape)) {
      context.minBounds = computeMinResizeBox(context);
    }
  });

}

ResizeCasePlanModelBehavior.$inject = [ 'eventBus', 'modeling' ];

module.exports = ResizeCasePlanModelBehavior;
