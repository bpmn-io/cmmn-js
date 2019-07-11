'use strict';

var inherits = require('inherits');

var SnapUtil = require('diagram-js/lib/features/snapping/SnapUtil');

var CreateMoveSnapping = require('diagram-js/lib/features/snapping/CreateMoveSnapping').default;

var isSnapped = SnapUtil.isSnapped,
    setSnapped = SnapUtil.setSnapped;

var asTRBL = require('diagram-js/lib/layout/LayoutUtil').asTRBL,
    getMid = require('diagram-js/lib/layout/LayoutUtil').getMid;

var getCriterionAttachment = require('./CmmnSnappingUtil').getCriterionAttachment;

var forEach = require('min-dash').forEach;


/**
 * Cmmn specific create move snapping functionality
 *
 * @param {EventBus} eventBus
 * @param {CmmnRules} cmmnRules
 */
function CmmnCreateMoveSnapping(eventBus, cmmnRules, injector) {

  injector.invoke(CreateMoveSnapping, this);

  function canAttach(shape, target, position) {
    return cmmnRules.canAttach([ shape ], target, null, position) === 'attach';
  }

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

inherits(CmmnCreateMoveSnapping, CreateMoveSnapping);

CmmnCreateMoveSnapping.$inject = [ 'eventBus', 'cmmnRules', 'injector' ];

module.exports = CmmnCreateMoveSnapping;


CmmnCreateMoveSnapping.prototype.initSnap = function(event) {
  var snapContext = CreateMoveSnapping.prototype.initSnap.call(this, event);

  var shape = event.shape;

  // snap to docking points
  forEach(shape.outgoing, function(connection) {
    var docking = connection.waypoints[0];

    docking = docking.original || docking;

    snapContext.setSnapOrigin(connection.id + '-docking', {
      x: docking.x - event.x,
      y: docking.y - event.y
    });
  });

  forEach(shape.incoming, function(connection) {
    var docking = connection.waypoints[connection.waypoints.length - 1];

    docking = docking.original || docking;

    snapContext.setSnapOrigin(connection.id + '-docking', {
      x: docking.x - event.x,
      y: docking.y - event.y
    });
  });

  return snapContext;
};


CmmnCreateMoveSnapping.prototype.addSnapTargetPoints = function(snapPoints, shape, target) {
  CreateMoveSnapping.prototype.addSnapTargetPoints.call(this, snapPoints, shape, target);

  var snapTargets = this.getSnapTargets(shape, target);

  // snap to docking points
  forEach(shape.incoming, function(connection) {

    if (!includes(snapTargets, connection.source)) {
      snapPoints.add('mid', getMid(connection.source));
    }

    var docking = connection.waypoints[0];

    snapPoints.add(connection.id + '-docking', docking.original || docking);
  });


  forEach(shape.outgoing, function(connection) {

    if (!includes(snapTargets, connection.target)) {
      snapPoints.add('mid', getMid(connection.target));
    }

    var docking = connection.waypoints[ connection.waypoints.length - 1 ];

    snapPoints.add(connection.id + '-docking', docking.original || docking);
  });

  return snapPoints;
};


// helpers ////////////////////

function includes(array, value) {
  return array.indexOf(value) !== -1;
}