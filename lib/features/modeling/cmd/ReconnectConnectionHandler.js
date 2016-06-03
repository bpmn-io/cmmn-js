'use strict';

var inherits = require('inherits');

var isArray = require('lodash/lang/isArray');

/**
 * Overwrites the behavior of diagram-js/ReconnectConnectionHandler to enable
 * a switch between source and target of a connection on reconnect.
 */
function ReconnectConnectionHandler(rules) {
  this._rules = rules;
}

inherits(ReconnectConnectionHandler, require('diagram-js/lib/features/modeling/cmd/ReconnectConnectionHandler'));

ReconnectConnectionHandler.$inject = [ 'rules' ];

module.exports = ReconnectConnectionHandler;


ReconnectConnectionHandler.prototype.execute = function(context) {

  var newSource = context.newSource,
      newTarget = context.newTarget,
      connection = context.connection,
      dockingOrPoints = context.dockingOrPoints,
      oldWaypoints = connection.waypoints,
      newWaypoints;

  if (!newSource && !newTarget) {
    throw new Error('newSource or newTarget are required');
  }

  context.oldWaypoints = oldWaypoints;

  if (isArray(dockingOrPoints)) {
    newWaypoints = dockingOrPoints;
  } else {
    newWaypoints = oldWaypoints.slice();

    newWaypoints.splice(newSource ? 0 : -1, 1, dockingOrPoints);
  }

  if (newSource) {
    context.oldSource = connection.source;
    connection.source = newSource;
  }

  if (newTarget) {
    context.oldTarget = connection.target;
    connection.target = newTarget;
  }

  connection.waypoints = newWaypoints;

  return connection;
};
