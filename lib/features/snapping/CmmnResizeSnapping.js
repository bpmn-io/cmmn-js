'use strict';

var is = require('../../util/ModelUtil').is,
    getDefinition = require('../../util/ModelUtil').getDefinition,
    isCollapsed = require('../../util/DiUtil').isCollapsed;

var SLIGHTLY_HIGHER_PRIORITY = 1001;


/**
 * Cmmn specific resize snapping functionality
 *
 * @param {EventBus} eventBus
 * @param {CmmnRules} cmmnRules
 */
function CmmnResizeSnapping(eventBus) {

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

CmmnResizeSnapping.$inject = [ 'eventBus', 'cmmnRules', 'injector' ];

module.exports = CmmnResizeSnapping;

// helpers //////////

function isStage(element) {
  return is(getDefinition(element), 'cmmn:PlanFragment');
}
