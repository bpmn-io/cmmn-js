'use strict';

var inherits = require('inherits');

var BaseLayouter = require('diagram-js/lib/layout/BaseLayouter').default,
    ManhattanLayout = require('diagram-js/lib/layout/ManhattanLayout');

var getMid = require('diagram-js/lib/layout/LayoutUtil').getMid;


function CmmnLayouter() {}

inherits(CmmnLayouter, BaseLayouter);

module.exports = CmmnLayouter;


CmmnLayouter.prototype.layoutConnection = function(connection, hints) {

  hints = hints || {};

  var source = hints.source || connection.source,
      target = hints.target || connection.target,
      waypoints = connection.waypoints,
      start = hints.connectionStart,
      end = hints.connectionEnd;


  if (!start) {
    start = getConnectionDocking(waypoints && waypoints[0], source);
  }

  if (!end) {
    end = getConnectionDocking(waypoints && waypoints[waypoints.length - 1], target);
  }

  var updatedWaypoints =
    ManhattanLayout.repairConnection(
      source, target,
      start, end,
      waypoints,
      hints);

  return updatedWaypoints || [ start, end ];
};

function getConnectionDocking(point, shape) {
  return point ? (point.original || point) : getMid(shape);
}