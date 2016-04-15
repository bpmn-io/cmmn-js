'use strict';

var inherits = require('inherits');

var BaseModeling = require('diagram-js/lib/features/modeling/Modeling');

var UpdatePropertiesHandler = require('./cmd/UpdatePropertiesHandler');
var UpdateSemanticParentHandler = require('./cmd/UpdateSemanticParentHandler');


/**
 * CMMN 1.1 modeling features activator
 *
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {CommandStack} commandStack
 */
function Modeling(eventBus, elementFactory, commandStack) {
  BaseModeling.call(this, eventBus, elementFactory, commandStack);
}

inherits(Modeling, BaseModeling);

Modeling.$inject = [ 'eventBus', 'elementFactory', 'commandStack' ];

module.exports = Modeling;


Modeling.prototype.getHandlers = function() {
  var handlers = BaseModeling.prototype.getHandlers.call(this);

  handlers['element.updateProperties'] = UpdatePropertiesHandler;
  handlers['element.updateSemanticParent'] = UpdateSemanticParentHandler;

  return handlers;
};


Modeling.prototype.updateProperties = function(element, properties, businessObject) {
  this._commandStack.execute('element.updateProperties', {
    element: element,
    properties: properties,
    businessObject: businessObject
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
