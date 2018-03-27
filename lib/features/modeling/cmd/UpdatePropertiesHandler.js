'use strict';

var reduce = require('min-dash').reduce,
    keys = require('min-dash').keys,
    forEach = require('min-dash').forEach,
    assign = require('min-dash').assign;

var getBusinessObject = require('../../../util/ModelUtil').getBusinessObject;

var NAME = 'name',
    STANDARD_EVENT = 'standardEvent',
    ID = 'id',
    DEFINITION_REF = 'definitionRef',
    SENTRY_REF = 'sentryRef',
    IS_STANDARD_EVENT_VISIBLE = 'isStandardEventVisible';

var flatten = require('min-dash').flatten;

/**
 * A handler that implements a CMMN 1.1 property update.
 *
 * This should be used to set simple properties on elements with
 * an underlying CMMN business object.
 *
 * Use respective diagram-js provided handlers if you would
 * like to perform automated modeling.
 */
function UpdatePropertiesHandler(elementRegistry, itemRegistry, moddle) {
  this._elementRegistry = elementRegistry;
  this._itemRegistry = itemRegistry;
  this._moddle = moddle;
}

UpdatePropertiesHandler.$inject = [ 'elementRegistry', 'itemRegistry', 'moddle' ];

module.exports = UpdatePropertiesHandler;


// api /////////////////

UpdatePropertiesHandler.prototype.preExecute = function(context) {

  var element = context.element,
      shape = context.shape;

  if (!element) {
    throw new Error('element required');
  }

  var bo = element.businessObject || element;

  context.businessObject = bo;

  var changed = [];

  if (element.businessObject) {
    changed.push(element);
  }

  if (shape) {
    changed.push(shape);
  }

  context.changed = flatten(changed);
};


/**
 * Updates a CMMN element with a list of new properties
 *
 * @param {Object} context
 * @param {djs.model.Base} context.element the element to update
 * @param {Object} context.properties a list of properties to set on the element's
 *                                    businessObject (the CMMN model element)
 *
 * @return {Array<djs.mode.Base>} the updated element
 */
UpdatePropertiesHandler.prototype.execute = function(context) {

  var elementRegistry = this._elementRegistry,
      itemRegistry = this._itemRegistry,
      ids = this._moddle.ids;

  var changed = context.changed;

  var element = context.element,
      businessObject = context.businessObject,
      properties = unwrapBusinessObjects(context.properties),
      oldProperties = context.oldProperties || getProperties(businessObject, keys(properties));

  if (isIdChange(properties, businessObject)) {
    ids.unclaim(businessObject[ID]);

    itemRegistry.updateId(businessObject, properties[ID]);

    var shape = elementRegistry.get(element.id);

    if (shape) {
      elementRegistry.updateId(shape, properties[ID]);
    }

    ids.claim(properties[ID], businessObject);
  }

  if (isDefinitionRefChange(properties, businessObject)) {
    itemRegistry.updateReference(businessObject, properties[DEFINITION_REF]);
  }

  if (isSentryRefChange(properties, businessObject)) {
    itemRegistry.updateReference(businessObject, properties[SENTRY_REF]);
  }

  if (NAME in properties) {

    forEach(changed, function(changedShape) {
      if (changedShape.label) {
        changed.push(changedShape.label);
      }
    });

  }

  if (STANDARD_EVENT in properties || IS_STANDARD_EVENT_VISIBLE in properties) {

    forEach(changed, function(changedShape) {
      if (changedShape.label) {
        changed.push(changedShape.label);
      }
    });

  }

  // update properties
  setProperties(businessObject, properties);

  // store old values
  context.oldProperties = oldProperties;

  // indicate changed on objects affected by the update
  return changed;
};

/**
 * Reverts the update on a CMMN elements properties.
 *
 * @param  {Object} context
 *
 * @return {djs.mode.Base} the updated element
 */
UpdatePropertiesHandler.prototype.revert = function(context) {

  var properties = context.properties,
      oldProperties = context.oldProperties,
      businessObject = context.businessObject,
      elementRegistry = this._elementRegistry,
      itemRegistry = this._itemRegistry,
      ids = this._moddle.ids;

  if (isIdChange(oldProperties, businessObject)) {
    itemRegistry.updateId(businessObject, oldProperties[ID]);
  }

  if (isDefinitionRefChange(oldProperties, businessObject)) {
    itemRegistry.updateReference(businessObject, oldProperties[DEFINITION_REF]);
  }

  if (isSentryRefChange(oldProperties, businessObject)) {
    itemRegistry.updateReference(businessObject, oldProperties[SENTRY_REF]);
  }

  // update properties
  setProperties(businessObject, oldProperties);

  if (isIdChange(properties, businessObject)) {
    ids.unclaim(properties[ID]);

    var shape = elementRegistry.get(properties[ID]);

    if (shape) {
      elementRegistry.updateId(shape, oldProperties[ID]);
    }

    ids.claim(oldProperties[ID], businessObject);
  }

  return context.changed;
};


function isIdChange(properties, businessObject) {
  return ID in properties && properties[ID] !== businessObject[ID];
}

function isDefinitionRefChange(properties, businessObject) {
  return DEFINITION_REF in properties && properties[DEFINITION_REF] !== businessObject[DEFINITION_REF];
}

function isSentryRefChange(properties, businessObject) {
  return SENTRY_REF in properties && properties[SENTRY_REF] !== businessObject[SENTRY_REF];
}


function getProperties(businessObject, propertyNames) {
  return reduce(propertyNames, function(result, key) {
    result[key] = businessObject.get(key);
    return result;
  }, {});
}


function setProperties(businessObject, properties) {
  forEach(properties, function(value, key) {
    businessObject.set(key, value);
  });
}


var referencePropertyNames = [ 'default' ];

/**
 * Make sure we unwrap the actual business object
 * behind diagram element that may have been
 * passed as arguments.
 *
 * @param  {Object} properties
 *
 * @return {Object} unwrappedProps
 */
function unwrapBusinessObjects(properties) {

  var unwrappedProps = assign({}, properties);

  referencePropertyNames.forEach(function(name) {
    if (name in properties) {
      unwrappedProps[name] = getBusinessObject(unwrappedProps[name]);
    }
  });

  return unwrappedProps;
}