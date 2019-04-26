'use strict';

var inherits = require('inherits');

var isArray = require('min-dash').isArray;

var BaseHandler = require('diagram-js/lib/features/modeling/cmd/ReconnectConnectionHandler').default;

/**
 * Overwrites the behavior of diagram-js/ReconnectConnectionHandler to enable
 * a switch between source and target of a connection on reconnect.
 */
function ReconnectConnectionHandler(injector) {
  injector.invoke(BaseHandler, this);
}

inherits(ReconnectConnectionHandler, BaseHandler);

ReconnectConnectionHandler.$inject = [ 'injector' ];

module.exports = ReconnectConnectionHandler;


ReconnectConnectionHandler.prototype.execute = function(context) {

  var newSource = context.newSource,
      newTarget = context.newTarget,
      connection = context.connection,
      dockingOrPoints = context.dockingOrPoints;

  if (!newSource && !newTarget) {
    throw new Error('newSource or newTarget are required');
  }

  // removed from corresponding method in diagram-js@3.3.0

  // if (newSource && newTarget) {
  //   throw new Error('must specify either newSource or newTarget');
  // }

  if (isArray(dockingOrPoints)) {
    context.oldWaypoints = connection.waypoints;
    connection.waypoints = dockingOrPoints;
  }

  if (newSource) {
    context.oldSource = connection.source;
    connection.source = newSource;
  }

  if (newTarget) {
    context.oldTarget = connection.target;
    connection.target = newTarget;
  }

  return connection;
};