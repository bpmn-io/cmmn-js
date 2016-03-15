'use strict';

var assign = require('lodash/object/assign'),
    inherits = require('inherits');

var Model = require('diagram-js/lib/model'),
    CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var Collections = require('diagram-js/lib/util/Collections');

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

  var parentDi = parentBusinessObject && parentBusinessObject.di;
  this.updateDiParent(businessObject.di, parentDi);
};

CmmnUpdater.prototype.updateSemanticParent = function(businessObject, newParent) {

  if (businessObject.$parent === newParent) {
    return;
  }

  var oldParent = businessObject.$parent;
  var definition = getDefinition(businessObject);

  /////////////////////////////////////////////////////////////
  // remove businessObject and its definition from oldParent //
  /////////////////////////////////////////////////////////////

  if (oldParent && isCasePlanModel(oldParent)) {
    // if oldParent is a casePlanModel, remove them from oldParent.
    Collections.remove(oldParent.get('planItems'), businessObject);
    Collections.remove(oldParent.get('planItemDefinitions'), definition);
  }

  if (oldParent && !isCasePlanModel(oldParent)) {
    // If oldParent is not a casePlanModel, remove them from the parentDefinition of oldParent.
    var oldParentDefinition = getDefinition(oldParent);

    Collections.remove(oldParentDefinition.get('planItems'), businessObject);
    Collections.remove(oldParentDefinition.get('planItemDefinitions'), definition);
  }

  ////////////////////////////////////////////////////////
  // add businessObject and its definition to newParent //
  ////////////////////////////////////////////////////////

  if (newParent && isCasePlanModel(newParent)) {
    // If newParent is a casePlanModel, add them to newParent
    newParent.get('planItems').push(businessObject);
    newParent.get('planItemDefinitions').push(definition);
  }

  if (newParent && !isCasePlanModel(newParent)) {
    // If newParent is not a casePlanModel, add them to the parentDefinition of newParent
    var newParentDefinition = getDefinition(newParent);

    newParentDefinition.get('planItems').push(businessObject);
    newParentDefinition.get('planItemDefinitions').push(definition);
  }

  ///////////////////////////////////////////
  // update $parent of the business object //
  ///////////////////////////////////////////

  if (!newParent) {
    businessObject.$parent = null;
  } else {
    businessObject.$parent = newParent;
  }

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
