'use strict';

var inherits = require('inherits');

var BaseLayouter = require('diagram-js/lib/layout/BaseLayouter'),
    ManhattanLayout = require('diagram-js/lib/layout/ManhattanLayout');

var getMid = require('diagram-js/lib/layout/LayoutUtil').getMid;

function CmmnLayouter() {}

inherits(CmmnLayouter, BaseLayouter);

module.exports = CmmnLayouter;

CmmnLayouter.prototype.layoutConnection = function(connection, layoutHints) {
  var source = connection.source,
      target = connection.target,
      waypoints = connection.waypoints,
      start,
      end;

  start = getConnectionDocking(waypoints, 0, source);
  end = getConnectionDocking(waypoints, waypoints && waypoints.length - 1, target);

  var updatedWaypoints =
    ManhattanLayout.repairConnection(
      source, target,
      start, end,
      waypoints,
      layoutHints);

  return updatedWaypoints || [ start, end ];
};

function getConnectionDocking(waypoints, idx, shape) {
  var point = waypoints && waypoints[idx];

  return point ? (point.original || point) : getMid(shape);
}
