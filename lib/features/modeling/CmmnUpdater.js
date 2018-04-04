'use strict';

var assign = require('min-dash').assign,
    inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor').default;

var Collections = require('diagram-js/lib/util/Collections');

var getBusinessObject = require('../../util/ModelUtil').getBusinessObject,
    is = require('../../util/ModelUtil').is,
    isCasePlanModel = require('../../util/ModelUtil').isCasePlanModel;

var getParent = require('./util/ModelingUtil').getParent,
    isLabel = require('./util/ModelingUtil').isLabel;

var isAny = require('./util/ModelingUtil').isAny;

/**
 * A handler responsible for updating the underlying CMMN 1.1 XML + DI
 * once changes on the diagram happen
 */
function CmmnUpdater(eventBus, cmmnFactory, itemRegistry, connectionDocking) {

  CommandInterceptor.call(this, eventBus);

  this._cmmnFactory = cmmnFactory;
  this._itemRegistry = itemRegistry;

  var self = this;


  // connection cropping /////////////////

  // crop connection ends during create/update
  function cropConnection(e) {
    var context = e.context,
        connection;

    if (!context.cropped) {
      connection = context.connection;
      connection.waypoints = connectionDocking.getCroppedWaypoints(connection);
      context.cropped = true;
    }
  }

  this.executed([
    'connection.layout',
    'connection.create',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], cropConnection);

  this.reverted([
    'connection.layout',
    'connection.create',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], function(e) {
    delete e.context.cropped;
  });

  // CMMN + DI update /////////////////

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

  this.executed([
    'shape.create',
    'shape.move',
    'shape.delete',
    'connection.delete',
    'connection.create'
  ], ifCmmn(updateParent));
  this.reverted([
    'shape.create',
    'shape.move',
    'shape.delete',
    'connection.delete',
    'connection.create'
  ], ifCmmn(reverseUpdateParent));


  // update bounds
  function updateBounds(e) {
    var shape = e.context.shape;
    self.updateBounds(shape);
  }

  this.executed([
    'shape.create',
    'shape.move',
    'shape.resize'
  ], ifCmmn(function(event) {

    // exclude labels because they're handled separately during shape.changed
    if (event.context.shape.type === 'label') {
      return;
    }

    updateBounds(event);
  }));

  this.reverted([
    'shape.create',
    'shape.move',
    'shape.resize'
  ], ifCmmn(function(event) {

    // exclude labels because they're handled separately during shape.changed
    if (event.context.shape.type === 'label') {
      return;
    }

    updateBounds(event);
  }));

  // Handle labels separately. This is necessary, because the label bounds have to be updated
  // every time its shape changes, not only on move, create and resize.
  eventBus.on('shape.changed', function(event) {
    if (event.element.type === 'label') {
      updateBounds({ context: { shape: event.element } });
    }
  });

  // attach / detach connection
  function updateConnection(e) {
    self.updateConnection(e.context);
  }

  this.executed([
    'connection.create',
    'connection.move',
    'connection.delete',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], ifCmmn(updateConnection));

  this.reverted([
    'connection.create',
    'connection.move',
    'connection.delete',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], ifCmmn(updateConnection));


  // update waypoints
  function updateConnectionWaypoints(e) {
    self.updateConnectionWaypoints(e.context.connection);
  }

  this.executed([
    'connection.create',
    'connection.layout',
    'connection.move',
    'connection.reconnectStart',
    'connection.reconnectEnd',
    'connection.updateWaypoints'
  ], ifCmmn(updateConnectionWaypoints));

  this.reverted([
    'connection.create',
    'connection.layout',
    'connection.move',
    'connection.reconnectStart',
    'connection.reconnectEnd',
    'connection.updateWaypoints'
  ], ifCmmn(updateConnectionWaypoints));

  // update attachments
  function updateAttachment(e) {
    self.updateAttachment(e.context);
  }

  this.executed([ 'element.updateAttachment' ], ifCmmn(updateAttachment));
  this.reverted([ 'element.updateAttachment' ], ifCmmn(updateAttachment));


  // update item registry

  function addItem(e) {
    var context = e.context,
        shape = context.shape,
        bo = getBusinessObject(shape);

    itemRegistry.add(bo);
  }

  function removeItem(e) {

    var context = e.context,
        shape = context.shape;

    if (isLabel(shape)) {
      return;
    }

    var bo = getBusinessObject(shape);
    itemRegistry.remove(bo);
  }

  this.executed('shape.create', ifCmmn(addItem));
  this.reverted('shape.create', ifCmmn(removeItem));

  this.executed('shape.delete', ifCmmn(removeItem));
  this.reverted('shape.delete', ifCmmn(addItem));

}

inherits(CmmnUpdater, CommandInterceptor);

module.exports = CmmnUpdater;

CmmnUpdater.$inject = [ 'eventBus', 'cmmnFactory', 'itemRegistry', 'connectionDocking' ];


// implementation /////////////////


CmmnUpdater.prototype.updateAttachment = function(context) {
  var shape = context.shape,
      businessObject = getBusinessObject(shape),
      host = shape.host,
      businessObjectHost = host && getBusinessObject(host);

  this.updateSemanticParent(businessObject, businessObjectHost);
};


CmmnUpdater.prototype.updateParent = function(element, oldParent) {
  // do not update CMMN 1.1 label parent
  if (isLabel(element)) {
    return;
  }

  var businessObject = getBusinessObject(element),
      parentBusinessObject = getBusinessObject(element.parent),
      businessObjectDi = businessObject.di || businessObject,
      parentDi = parentBusinessObject && parentBusinessObject.di;

  if (isAssociation(businessObject)) {
    businessObject = businessObject.cmmnElementRef;
  }

  if (shouldUpdateSemanticParent(businessObject)) {
    this.updateSemanticParent(businessObject, parentBusinessObject);
  }

  if (is(parentBusinessObject, 'cmmndi:CMMNDiagram')) {
    parentDi = parentBusinessObject;
  }

  this.updateDiParent(businessObjectDi, parentDi);
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

  } else

  if (isCasePlanModel(businessObject)) {
    containment = 'cases';
    businessObject = businessObject.$parent;
    newParent = newParent && getDefinitions(newParent);
  } else

  if (is(businessObject, 'cmmn:EntryCriterion')) {

    if (isCasePlanModel(newParent)) {
      newParent = null;
    }

    containment = 'entryCriteria';
  } else

  if (is(businessObject, 'cmmn:ExitCriterion')) {
    containment = 'exitCriteria';
  } else

  if (is(businessObject, 'cmmn:Artifact')) {
    newParent = newParent && getDefinitions(newParent);
    containment = 'artifacts';
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
  var di = shape.businessObject.di || shape.businessObject;

  var bounds = isLabel(shape) ? this._getLabel(di).bounds : di.bounds;

  assign(bounds, {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height
  });
};


CmmnUpdater.prototype.updateConnectionWaypoints = function(connection) {
  var di = connection.businessObject;
  di.set('waypoint', this._cmmnFactory.createDiWaypoints(connection.waypoints));
};


CmmnUpdater.prototype.updateConnection = function(context) {

  var connection = context.connection,
      businessObject = getBusinessObject(connection),
      newSource = getBusinessObject(connection.source),
      newTarget = getBusinessObject(connection.target),
      cmmnElement = businessObject.cmmnElementRef,
      sourceElem,
      targetElem,
      sourceAttr,
      targetAttr;


  if (is(cmmnElement, 'cmmn:Association')) {
    sourceElem = cmmnElement;
    targetElem = cmmnElement;

    sourceAttr = 'sourceRef';
    targetAttr = 'targetRef';
  }
  else {
    targetElem = businessObject;
    targetAttr = 'targetCMMNElementRef';

    if (is(cmmnElement, 'cmmn:OnPart')) {

      sourceElem = cmmnElement;
      sourceAttr = 'sourceRef';

      var newExitCriterionRef;
      if (is(newSource, 'cmmn:ExitCriterion')) {
        newExitCriterionRef = newSource;
        newSource = getParent(newExitCriterionRef);
      }

      if (cmmnElement.exitCriterionRef !== newExitCriterionRef) {
        cmmnElement.exitCriterionRef = newExitCriterionRef;
      }

    }
    else {
      sourceElem = businessObject;
      sourceAttr = 'sourceCMMNElementRef';
    }

  }

  if (sourceAttr && sourceElem[sourceAttr] !== newSource) {
    sourceElem[sourceAttr] = newSource;
  }

  if (targetAttr && targetElem[targetAttr] !== newTarget) {
    targetElem[targetAttr] = newTarget;
  }

  this.updateConnectionWaypoints(connection);
};

// helpers /////////////////

CmmnUpdater.prototype._getLabel = function(di) {

  if (!di.label) {
    di.label = this._cmmnFactory.createDiLabel();
  }

  if (!di.label.bounds) {
    di.label.bounds = this._cmmnFactory.createDiBounds();
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

    if (is(element, 'cmmn:CMMNElement') || is(element, 'cmmndi:CMMNDiagramElement')) {
      fn(event);
    }
  };
}

/**
 * Returns the cmmn:Definitions element for a given element.
 */
function getDefinitions(element) {
  return getParent(element, 'cmmn:Definitions');
}

function shouldUpdateSemanticParent(element) {
  return !isAny(element, [
    'cmmn:CaseFileItem',
    'cmmn:Criterion',
    'cmmn:DiscretionaryItem',
    'cmmn:OnPart',
    'cmmndi:CMMNEdge'
  ]);
}

function isAssociation(connection) {
  connection = connection.businessObject || connection;
  return !!(connection.cmmnElementRef && is(connection.cmmnElementRef, 'cmmn:Association'));
}
