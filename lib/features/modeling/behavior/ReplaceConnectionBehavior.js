'use strict';

var forEach = require('lodash/collection/forEach'),
    inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is;

var LOW_PRIORITY = 200;

function ReplaceConnectionBehavior(eventBus, modeling, cmmnRules) {

  CommandInterceptor.call(this, eventBus);

  function fixConnection(connection) {

    var source = connection.source,
        target = connection.target,
        parent = connection.parent;

    // do not do anything if connection
    // is already deleted (may happen due to other
    // behaviors plugged-in before)
    if (!parent) {
      return;
    }

    var remove;

    /**
     * Check if incoming or outgoing connections can stay.
     */

    if (is(connection, 'cmmndi:CMMNEdge')) {
      if (!cmmnRules.canConnectDiscretionaryConnection(source, target, connection)) {
        remove = true;
      }
    }

    // remove invalid connection,
    // unless it has been removed already
    if (remove) {
      modeling.removeConnection(connection);
    }

  }

  this.postExecuted('elements.move', LOW_PRIORITY, function(context) {

    var closure = context.closure,
        allConnections = closure.allConnections;

    forEach(allConnections, fixConnection);
  }, true);

}

inherits(ReplaceConnectionBehavior, CommandInterceptor);

ReplaceConnectionBehavior.$inject = [ 'eventBus', 'modeling', 'cmmnRules' ];

module.exports = ReplaceConnectionBehavior;
