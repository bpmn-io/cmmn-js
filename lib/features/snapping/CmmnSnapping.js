'use strict';

var inherits = require('inherits');

var is = require('../../util/ModelUtil').is,
    isCasePlanModel = require('../../util/ModelUtil').isCasePlanModel,
    getDefinition = require('../../util/ModelUtil').getDefinition,
    isCollapsed = require('../../util/DiUtil').isCollapsed;

var Snapping = require('diagram-js/lib/features/snapping/Snapping');

var SLIGHTLY_HIGHER_PRIORITY = 1001;

function isStage(element) {
  return !!(isCasePlanModel(element) || is(getDefinition(element), 'cmmn:Stage'));
}


/**
 * Cmmn specific snapping functionality
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function CmmnSnapping(eventBus, canvas) {

  // instantiate super
  Snapping.call(this, eventBus, canvas);

  eventBus.on('resize.start', SLIGHTLY_HIGHER_PRIORITY + 500, function(event) {
    var context = event.context,
        shape = context.shape;

    if (isStage(shape) && !isCollapsed(shape)) {
      context.minDimensions = { width: 140, height: 120 };
    }

    if (is(shape, 'cmmn:TextAnnotation')) {
      context.minDimensions = { width: 50, height: 30 };
    }

  });

}

inherits(CmmnSnapping, Snapping);

CmmnSnapping.$inject = [ 'eventBus', 'canvas' ];

module.exports = CmmnSnapping;
