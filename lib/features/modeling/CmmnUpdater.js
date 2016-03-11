'use strict';

var assign = require('lodash/object/assign'),
    inherits = require('inherits');

var Model = require('diagram-js/lib/model'),
    CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var getBusinessObject = require('../../util/ModelUtil').getBusinessObject,
    is = require('../../util/ModelUtil').is,
    getDefinition = require('../../util/ModelUtil').getDefinition,
    isCasePlanModel = require('../../util/ModelUtil').isCasePlanModel;

/**
 * A handler responsible for updating the underlying CMMN 1.1 XML + DI
 * once changes on the diagram happen
 */
function CmmnUpdater(eventBus, cmmnFactory) {

  CommandInterceptor.call(this, eventBus);

  this._cmmnFactory = cmmnFactory;

  var self = this;


  ////// CMMN + DI update /////////////////////////


  // update parent
  function updateParent(e) {
    var context = e.context;

    self.updateParent(context.shape || context.connection, context.oldParent);
  }

  function reverseUpdateParent(e) {
    var context = e.context;

    var element = context.shape || context.connection,
        // oldParent is the (old) new parent, because we are undoing
        oldParent = context.parent || context.newParent;

    self.updateParent(element, oldParent);
  }

  this.executed([ 'shape.create' ], ifCmmn(updateParent));
  this.reverted([ 'shape.create' ], ifCmmn(reverseUpdateParent));


  // update bounds
  function updateBounds(e) {
    var shape = e.context.shape;

    if (!is(shape, 'cmmn:CMMNElement')) {
      return;
    }

    self.updateBounds(shape);
  }

  this.executed([ 'shape.create' ], ifCmmn(updateBounds));
  this.reverted([ 'shape.create' ], ifCmmn(updateBounds));

}

inherits(CmmnUpdater, CommandInterceptor);

module.exports = CmmnUpdater;

CmmnUpdater.$inject = [ 'eventBus', 'cmmnFactory' ];


/////// implementation //////////////////////////////////

CmmnUpdater.prototype.updateParent = function(element, oldParent) {

  var businessObject = getBusinessObject(element),
      parentBusinessObject = getBusinessObject(element.parent);

  this.updateSemanticParent(businessObject, parentBusinessObject);
  this.updateDiParent(businessObject.di, parentBusinessObject.di);
};

CmmnUpdater.prototype.updateSemanticParent = function(businessObject, newParent) {

  if (businessObject.$parent === newParent) {
    return;
  }

  var planItems,
      planItemDefinitions;

  if (isCasePlanModel(newParent)) {
    // If the newParent is a case plan, make sure to add the businessObject
    // and its definition to the planItems and planItemDefinitions collection
    // of this case plan.
    planItems = newParent.get('planItems');
    planItemDefinitions = newParent.get('planItemDefinitions');

  } else {
    // Add the businessObject and its definition to the parentDefinition planItems
    // and planItemDefinitions.
    var parentDefinition = getDefinition(newParent);

    planItems = parentDefinition.get('planItems');
    planItemDefinitions = parentDefinition.get('planItemDefinitions');
  }

  var definition = getDefinition(businessObject);

  planItems.push(businessObject);
  planItemDefinitions.push(definition);

  // update the $parent of the business object
  businessObject.$parent = newParent;
};

CmmnUpdater.prototype.updateDiParent = function(di, parentDi) {

  if (parentDi && !is(parentDi, 'cmmndi:CMMNDiagram')) {
    parentDi = parentDi.$parent;
  }

  if (di.$parent === parentDi) {
    return;
  }

  var diagramElements = (parentDi || di.$parent).get('diagramElements');

  if (parentDi) {
    diagramElements.push(di);
    di.$parent = parentDi;
  }
};

CmmnUpdater.prototype.updateBounds = function(shape) {
  var di = shape.businessObject.di;

  var bounds = (shape instanceof Model.Label) ? this._getLabel(di).bounds : di.bounds;

  assign(bounds, {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height
  });
};

/////// helpers /////////////////////////////////////////

CmmnUpdater.prototype._getLabel = function(di) {
  if (!di.label) {
    di.label = this._cmmnFactory.createDiLabel();
  }

  return di.label;
};


/**
 * Make sure the event listener is only called
 * if the touched element is a CMMN element.
 *
 * @param  {Function} fn
 * @return {Function} guarded function
 */
function ifCmmn(fn) {

  return function(event) {

    var context = event.context,
        element = context.shape || context.connection;

    if (is(element, 'cmmn:CMMNElement')) {
      fn(event);
    }
  };
}
