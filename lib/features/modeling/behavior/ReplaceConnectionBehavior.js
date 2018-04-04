'use strict';

var forEach = require('min-dash').forEach,
    inherits = require('inherits'),
    assign = require('min-dash').assign;

var isArray = require('min-dash').isArray;

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor').default;

var is = require('../../../util/ModelUtil').is;

var LOW_PRIORITY = 200,
    HIGH_PRIORITY = 5000;

function ReplaceConnectionBehavior(eventBus, modeling, cmmnRules, selection, rules) {

  CommandInterceptor.call(this, eventBus);


  function canConnectPlanItemOnPartConnection(source, target) {
    return cmmnRules.canConnectPlanItemOnPartConnection(source, target);
  }


  function canConnectCaseFileItemOnPartConnection(source, target) {
    return cmmnRules.canConnectCaseFileItemOnPartConnection(source, target);
  }


  function canConnectDiscretionaryConnection(source, target, connection) {
    return cmmnRules.canConnectDiscretionaryConnection(source, target, connection);
  }


  function canConnectAssociation(source, target) {
    return cmmnRules.canConnectAssociation(source, target);
  }


  function canReconnect(type, attrs) {
    return rules.allowed(type, attrs);
  }

  function fixConnection(connection, source, target, hints) {

    var parent = connection.parent;

    hints = hints || {};
    source = source || connection.source;
    target = target || connection.target;

    if (!parent) {
      return;
    }

    var remove,
        replacement,
        cmmnElement = getCmmnElement(connection);

    /**
     * Check if incoming or outgoing connections can stay and/or replaced.
     */

    if (cmmnElement) {

      if (is(cmmnElement, 'cmmn:PlanItemOnPart')) {

        if (!canConnectPlanItemOnPartConnection(source, target)) {
          remove = true;
        }

        if (canConnectCaseFileItemOnPartConnection(source, target)) {
          replacement = {
            type: 'cmmn:CaseFileItemOnPart',
            name: cmmnElement.name,
            isStandardEventVisible: isStandardEventVisible(connection)
          };
        }

        if (canConnectDiscretionaryConnection(source, target, connection)) {
          replacement = {
            type: 'cmmndi:CMMNEdge'
          };
        }

      }


      if (is(cmmnElement, 'cmmn:CaseFileItemOnPart')) {

        if (!canConnectCaseFileItemOnPartConnection(source, target)) {
          remove = true;
        }

        if (canConnectPlanItemOnPartConnection(source, target)) {
          replacement = {
            type: 'cmmn:PlanItemOnPart',
            name: cmmnElement.name,
            isStandardEventVisible: isStandardEventVisible(connection)
          };
        }

      }

      if (is(cmmnElement, 'cmmn:Association') && !canConnectAssociation(source, target)) {
        remove = true;
      }

    }
    else {

      if (!canConnectDiscretionaryConnection(source, target, connection)) {
        remove = true;
      }

      if (canConnectPlanItemOnPartConnection(source, target)) {
        replacement = {
          type: 'cmmn:PlanItemOnPart',
          isStandardEventVisible: true
        };
      }

    }

    if (remove) {

      if (!replacement && (isTextAnnotation(source) || isTextAnnotation(target))) {

        replacement = {
          type: 'cmmn:Association'
        };
      }

      modeling.removeConnection(connection);
    }

    if (replacement) {

      var attrs = assign({
        waypoints: connection.waypoints.slice()
      }, replacement);

      var newConnection = modeling.connect(source, target, attrs);

      if (hints.select !== false) {
        selection.select(newConnection);
      }

      return newConnection;

    }

  }


  this.postExecuted('elements.move', LOW_PRIORITY, function(context) {

    var closure = context.closure,
        allConnections = closure.allConnections;

    forEach(allConnections, function(connection) {
      fixConnection(connection, null, null, {
        select: false
      });
    });

  }, true);


  this.preExecute([
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], HIGH_PRIORITY + LOW_PRIORITY, function(event) {

    var type = event.command,
        isReconnectStart = (type === 'connection.reconnectStart'),
        context = event.context,
        connection = context.connection,
        source = context.newSource || connection.source,
        target = context.newTarget || connection.target,
        dockingOrPoints = context.dockingOrPoints,
        canExecute = context.canExecute;

    if (context.hints && context.hints.nested) {
      return;
    }

    if (canExecute === undefined) {

      var attrs = {
        connection: connection
      };

      attrs[ isReconnectStart ? 'hover' : 'source' ] = source;
      attrs[ !isReconnectStart ? 'hover' : 'target' ] = target;

      canExecute = canReconnect(type, attrs);

    }

    if (canExecute && canExecute.reverse) {

      if (!isArray(dockingOrPoints)) {
        var waypoints = connection.waypoints.slice();
        waypoints.splice(isReconnectStart ? 0 : -1, 1, dockingOrPoints);
        dockingOrPoints = waypoints;
      }

      context.newSource = target;
      context.newTarget = source;
      context.dockingOrPoints = dockingOrPoints.reverse();

    }

  });


  this.preExecute([
    'connection.reconnectStart',
    'connection.reconnectEnd'
  ], HIGH_PRIORITY, function(context) {

    var connection = context.connection,
        source = context.newSource || connection.source,
        target = context.newTarget || connection.target,
        hints = context.hints || {};

    context.connection = fixConnection(connection, source, target, {
      select: !hints.nested
    }) || connection;

  }, true);


  this.postExecuted('shape.replace', function(context) {

    var shape = context.newShape,
        bo = shape.businessObject,
        connections = getAttachersOutgoingConnections(shape);

    forEach(connections, function(connection) {

      var source = connection.source,
          target = connection.target,
          cmmnElement = getCmmnElement(connection);

      if (is(cmmnElement, 'cmmn:PlanItemOnPart')) {

        if (canConnectPlanItemOnPartConnection(source, target)) {
          modeling.updateProperties(cmmnElement, { sourceRef: bo }, connection);
        }
        else {
          modeling.removeConnection(connection);
        }

      }

    });

  }, true);


  this.postExecuted('element.updateProperties', function(context) {

    var properties = context.properties,
        changed = context.changed;

    if (properties && properties.isBlocking === false) {

      forEach(changed, function(shape) {

        var connections = shape.outgoing;

        forEach(connections, function(connection) {
          fixConnection(connection, null, null, {
            select: false
          });
        });

      });

    }

  }, true);

}

inherits(ReplaceConnectionBehavior, CommandInterceptor);

ReplaceConnectionBehavior.$inject = [ 'eventBus', 'modeling', 'cmmnRules', 'selection', 'rules' ];

module.exports = ReplaceConnectionBehavior;


function isStandardEventVisible(connection) {
  return connection.businessObject.isStandardEventVisible;
}

function getCmmnElement(connection) {
  return connection.businessObject && connection.businessObject.cmmnElementRef;
}

function getAttachersOutgoingConnections(shape) {

  var attachers = shape.attachers,
      connections = [];

  forEach(attachers, function(attacher) {
    forEach(attacher.outgoing, function(connection) {
      connections.push(connection);
    });
  });

  return connections;
}

function isTextAnnotation(element) {
  return is(element, 'cmmn:TextAnnotation');
}