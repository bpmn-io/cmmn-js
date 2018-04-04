'use strict';

var inherits = require('inherits');

var BaseHandler = require('diagram-js/lib/features/modeling/cmd/ReplaceShapeHandler').default;


function ReplaceShapeHandler(modeling, rules) {
  this._modeling = modeling;
  this._rules = rules;
}

inherits(ReplaceShapeHandler, BaseHandler);

ReplaceShapeHandler.$inject = [ 'modeling', 'rules' ];

module.exports = ReplaceShapeHandler;


// api /////////////////


ReplaceShapeHandler.prototype.createShape = function(shape, position, target) {
  var modeling = this._modeling;
  return modeling.createShape(shape, position, target, {
    nested: true
  });
};


ReplaceShapeHandler.prototype.reconnectStart = function(connection, newSource, dockingPoint) {
  var modeling = this._modeling;
  modeling.reconnectStart(connection, newSource, dockingPoint, {
    nested: true,
    startChanged: true
  });
};


ReplaceShapeHandler.prototype.reconnectEnd = function(connection, newTarget, dockingPoint) {
  var modeling = this._modeling;
  modeling.reconnectEnd(connection, newTarget, dockingPoint, {
    nested: true,
    endChanged: true
  });
};
