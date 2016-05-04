'use strict';

var forEach = require('lodash/collection/forEach'),
    inherits = require('inherits'),
    assign = require('lodash/object/assign');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is;

var LOW_PRIORITY = 200,
    HIGH_PRIORITY = 5000;

function ReplaceConnectionBehavior(eventBus, modeling, cmmnRules) {

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


  function fixConnection(connection, source, target) {

    var parent = connection.parent;
    
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
      modeling.removeConnection(connection);
    }

    if (replacement) {

      var attrs = assign({
        waypoints: connection.waypoints.slice()
      }, replacement);

      return modeling.connect(source, target, attrs);

    }

  }


  this.postExecuted('elements.move', LOW_PRIORITY, function(context) {

    var closure = context.closure,
        allConnections = closure.allConnections;

    forEach(allConnections, function(connection) {
      fixConnection(connection);
    });

  }, true);


  this.preExecute([
    'connection.reconnectStart',
    'connection.reconnectEnd'
  ], HIGH_PRIORITY, function(context) {

    var connection = context.connection,
        source = context.newSource || connection.source,
        target = context.newTarget || connection.target;

    context.connection = fixConnection(connection, source, target) || connection;

  }, true);


}

inherits(ReplaceConnectionBehavior, CommandInterceptor);

ReplaceConnectionBehavior.$inject = [ 'eventBus', 'modeling', 'cmmnRules' ];

module.exports = ReplaceConnectionBehavior;


function isStandardEventVisible(connection) {
  return connection.businessObject.isStandardEventVisible;
}

function getCmmnElement(connection) {
  return connection.businessObject && connection.businessObject.cmmnElementRef;
}