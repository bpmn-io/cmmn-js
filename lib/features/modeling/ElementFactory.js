'use strict';

var assign = require('lodash/object/assign'),
    inherits = require('inherits');

var BaseElementFactory = require('diagram-js/lib/core/ElementFactory'),
    LabelUtil = require('../../util/LabelUtil');


/**
 * A bpmn-aware factory for diagram-js shapes
 */
function ElementFactory(cmmnFactory, moddle) {
  BaseElementFactory.call(this);

  this._cmmnFactory = cmmnFactory;
  this._moddle = moddle;
}

inherits(ElementFactory, BaseElementFactory);


ElementFactory.$inject = [ 'cmmnFactory', 'moddle' ];

module.exports = ElementFactory;

ElementFactory.prototype.baseCreate = BaseElementFactory.prototype.create;

ElementFactory.prototype.create = function(elementType, attrs) {
  // no special magic for labels,
  // we assume their businessObjects have already been created
  // and wired via attrs
  if (elementType === 'label') {
    return this.baseCreate(elementType, assign({ type: 'label' }, LabelUtil.DEFAULT_LABEL_SIZE, attrs));
  }

  return this.createCmmnElement(elementType, attrs);
};

ElementFactory.prototype.createCmmnElement = function(elementType, attrs) {
  var size;

  attrs = attrs || {};

  var businessObject = attrs.businessObject;

  if (!businessObject) {
    if (!attrs.type) {
      throw new Error('no shape type specified');
    }

    businessObject = this._cmmnFactory.createItem(attrs.type, attrs.definitionType);

    delete attrs.definitionType;
  }

  if (!businessObject.di) {
    businessObject.di = this._cmmnFactory.createDiShape(businessObject, {}, {
      id: businessObject.id + '_di'
    });
  }

  size = this._getDefaultSize(businessObject);

  attrs = assign({
    businessObject: businessObject,
    id: businessObject.id
  }, size, attrs);

  return this.baseCreate(elementType, attrs);
};


ElementFactory.prototype._getDefaultSize = function(semantic) {
  // TODO: return element specific default size
  return { width: 100, height: 80 };
};

ElementFactory.prototype.createPlanItemShape = function(type) {
  return this.createShape({ type: 'cmmn:PlanItem', definitionType: type });
};