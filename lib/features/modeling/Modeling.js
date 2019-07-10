'use strict';

var inherits = require('inherits');

var assign = require('min-dash').assign;

var BaseModeling = require('diagram-js/lib/features/modeling/Modeling').default;

var AppendShapeHandler = require('./cmd/AppendShapeHandler');
var ReconnectConnectionHandler = require('./cmd/ReconnectConnectionHandler');
var ReplaceShapeHandler = require('./cmd/ReplaceShapeHandler');

var UpdatePropertiesHandler = require('./cmd/UpdatePropertiesHandler');
var UpdateSemanticParentHandler = require('./cmd/UpdateSemanticParentHandler');
var UpdateControlsHandler = require('./cmd/UpdateControlsHandler');

var IdClaimHandler = require('./cmd/IdClaimHandler');

/**
 * CMMN 1.1 modeling features activator
 *
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {CommandStack} commandStack
 */
function Modeling(eventBus, elementFactory, commandStack, cmmnRules, rules) {
  BaseModeling.call(this, eventBus, elementFactory, commandStack);

  this._cmmnRules = cmmnRules;
  this._rules = rules;
}

inherits(Modeling, BaseModeling);

Modeling.$inject = [ 'eventBus', 'elementFactory', 'commandStack', 'cmmnRules', 'rules' ];

module.exports = Modeling;


Modeling.prototype.getHandlers = function() {
  var handlers = BaseModeling.prototype.getHandlers.call(this);

  handlers['shape.append'] = AppendShapeHandler;
  handlers['shape.replace'] = ReplaceShapeHandler;
  handlers['connection.reconnectStart'] = ReconnectConnectionHandler;
  handlers['connection.reconnectEnd'] = ReconnectConnectionHandler;

  handlers['element.updateProperties'] = UpdatePropertiesHandler;
  handlers['element.updateSemanticParent'] = UpdateSemanticParentHandler;

  handlers['element.updateControls'] = UpdateControlsHandler;

  handlers['id.updateClaim'] = IdClaimHandler;

  return handlers;
};


Modeling.prototype.connect = function(source, target, attrs, hints) {

  var rules = this._rules;

  if (!attrs) {
    attrs = rules.allowed('connection.create', {
      source: source,
      target: target
    }) || { type: 'cmmn:Association' };
  }

  if (attrs.reverse) {

    if (hints) {
      hints = {
        connectionStart: hints.connectionEnd,
        connectionEnd: hints.connectionStart
      };
    }

    return this.createConnection(target, source, attrs, target.parent, hints);
  }

  return this.createConnection(source, target, attrs, source.parent, hints);
};


Modeling.prototype.createConnection = function(source, target, targetIndex, connection, parent, hints) {

  // Overwrite existing createConnection() method to provide additional
  // information in the context. This must be done to enable the replacement
  // of the target element, if necessary.

  if (typeof targetIndex === 'object') {
    hints = parent;
    parent = connection;
    connection = targetIndex;
    targetIndex = undefined;
  }

  var context = {
    source: source,
    target: target,
    parent: parent,
    parentIndex: targetIndex,
    canExecute: connection,
    hints: hints
  };

  connection = this._create('connection', connection);

  assign(context, {
    connection: connection
  });

  this._commandStack.execute('connection.create', context);

  return context.connection;
};


Modeling.prototype.reconnectStart = function(connection, newSource, dockingOrPoints, hints) {
  var context = {
    connection: connection,
    newSource: newSource,
    dockingOrPoints: dockingOrPoints,
    hints: hints || {}
  };

  this._commandStack.execute('connection.reconnectStart', context);
};


Modeling.prototype.reconnectEnd = function(connection, newTarget, dockingOrPoints, hints) {
  var context = {
    connection: connection,
    newTarget: newTarget,
    dockingOrPoints: dockingOrPoints,
    hints: hints || {}
  };

  this._commandStack.execute('connection.reconnectEnd', context);
};


Modeling.prototype.updateProperties = function(element, properties, shape) {
  this._commandStack.execute('element.updateProperties', {
    element: element,
    properties: properties,
    shape: shape
  });
};


Modeling.prototype.updateSemanticParent = function(element, newParent, containment, shape) {
  this._commandStack.execute('element.updateSemanticParent', {
    element: element,
    newParent: newParent,
    containment: containment,
    shape: shape
  });
};


Modeling.prototype.updateControls = function(element, values) {
  this._commandStack.execute('element.updateControls', {
    element: element,
    values: values
  });
};


Modeling.prototype.claimId = function(id, moddleElement) {
  this._commandStack.execute('id.updateClaim', {
    id: id,
    element: moddleElement,
    claiming: true
  });
};


Modeling.prototype.unclaimId = function(id, moddleElement) {
  this._commandStack.execute('id.updateClaim', {
    id: id,
    element: moddleElement
  });
};
