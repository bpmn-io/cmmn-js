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

  if (is(element, 'cmmn:PlanItem')) {
    this.updatePlanItemDefinitionRefs(element, parentBusinessObject);
  }

  this.updateSemanticParent(businessObject, parentBusinessObject);

  var parentDi = parentBusinessObject && parentBusinessObject.di;
  this.updateDiParent(businessObject.di, parentDi);
};


CmmnUpdater.prototype.updatePlanItemDefinitionRefs = function(element, newParent) {

  var containment = 'planItemDefinitions';

  var businessObject = getDefinition(element);

  if (newParent && !isCasePlanModel(newParent)) {
    newParent = newParent.definitionRef;
  }

  var children;

  if (businessObject.$parent) {
    // remove from old parent
    children = businessObject.$parent.get(containment);
    Collections.remove(children, businessObject);
  }

  if (newParent) {
    // add to new parent
    children = newParent.get(containment);
    children.push(businessObject);
    businessObject.$parent = newParent;
  } else {
    businessObject.$parent = null;
  }

};

/**
 * Update the semantic parent
 *
 * - add/remove the business object to/from the parent's containment(s)
 * - set/unset the $parent property of the business object
 *
 * @param  {ModdleElement} businessObject
 * @param  {ModdleElement} newParent
 */
CmmnUpdater.prototype.updateSemanticParent = function(businessObject, newParent) {

  var containment;

  if (businessObject.$parent === newParent) {
    return;
  }

  if (is(businessObject, 'cmmn:PlanItem')) {
    containment = 'planItems';

    if (newParent && !isCasePlanModel(newParent)) {
      newParent = newParent.definitionRef;
    }

  }

  if (!containment) {
    throw new Error('no parent for ', businessObject, newParent);
  }

  var children;

  if (businessObject.$parent) {
    // remove from old parent
    children = businessObject.$parent.get(containment);
    Collections.remove(children, businessObject);
  }

  if (newParent) {
    // add to new parent
    children = newParent.get(containment);
    children.push(businessObject);
    businessObject.$parent = newParent;
  } else {
    businessObject.$parent = null;
  }

};


/**
 * Upate the parent of an DI element
 *
 * - Add/remove DI element to the root element's diagramElements conainment
 * - Set/unset the $parent property of the DI element
 *
 * @param  {ModdleElement} di
 * @param  {ModdleElement} parentDi
 */
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
  else {
    Collections.remove(diagramElements, di);
    di.$parent = null;
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