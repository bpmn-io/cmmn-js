'use strict';

var inherits = require('inherits');

var is = require('../../util/ModelUtil').is,
    getDefinition = require('../../util/ModelUtil').getDefinition,
    isCollapsed = require('../../util/DiUtil').isCollapsed;

var Snapping = require('diagram-js/lib/features/snapping/Snapping'),
    SnapUtil = require('diagram-js/lib/features/snapping/SnapUtil');

var isSnapped = SnapUtil.isSnapped,
    setSnapped = SnapUtil.setSnapped;

var asTRBL = require('diagram-js/lib/layout/LayoutUtil').asTRBL;

var SLIGHTLY_HIGHER_PRIORITY = 1001;

var getCriterionAttachment = require('./CmmnSnappingUtil').getCriterionAttachment;


function isStage(element) {
  return is(getDefinition(element), 'cmmn:PlanFragment');
}


/**
 * Cmmn specific snapping functionality
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function CmmnSnapping(eventBus, canvas, cmmnRules) {

  // instantiate super
  Snapping.call(this, eventBus, canvas);

  function canAttach(shape, target, position) {
    return cmmnRules.canAttach([ shape ], target, null, position) === 'attach';
  }

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

  eventBus.on([
    'create.move',
    'create.end',
    'shape.move.move',
    'shape.move.end'
  ], 1500, function(event) {

    var context = event.context,
        target = context.target,
        shape = context.shape;

    if (target && !isSnapped(event) && canAttach(shape, target, event)) {
      snapCriterion(event, shape, target);
    }
  });


  function snapCriterion(event, shape, target) {
    var targetTRBL = asTRBL(target);

    var direction = getCriterionAttachment(event, target);

    if (/top/.test(direction)) {
      setSnapped(event, 'y', targetTRBL.top);
    } else
    if (/bottom/.test(direction)) {
      setSnapped(event, 'y', targetTRBL.bottom);
    }

    if (/left/.test(direction)) {
      setSnapped(event, 'x', targetTRBL.left);
    } else
    if (/right/.test(direction)) {
      setSnapped(event, 'x', targetTRBL.right);
    }
  }
}

inherits(CmmnSnapping, Snapping);

CmmnSnapping.$inject = [ 'eventBus', 'canvas', 'cmmnRules' ];

module.exports = CmmnSnapping;
