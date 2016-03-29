'use strict';

var assign = require('lodash/object/assign'),
    inherits = require('inherits');

var BaseElementFactory = require('diagram-js/lib/core/ElementFactory'),
    LabelUtil = require('../../util/LabelUtil');

var is = require('../../util/ModelUtil').is,
    getDefinition = require('../../util/ModelUtil').getDefinition,
    isCasePlanModel = require('../../util/ModelUtil').isCasePlanModel;


/**
 * A cmmn-aware factory for diagram-js shapes
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

  if (elementType === 'root') {
    return this.baseCreate(elementType, attrs);
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
    businessObject = this._cmmnFactory.create(attrs.type);
  }

  if (!businessObject.di) {
    if (elementType === 'connection') {
      if (!is(businessObject, 'cmmndi:CMMNEdge')) {
        businessObject.di = this._cmmnFactory.createDiEdge(businessObject, [], {
          id: businessObject.id + '_di'
        });
      }
    } else {
      businessObject.di = this._cmmnFactory.createDiShape(businessObject, {}, {
        id: businessObject.id + '_di'
      });
    }
  }

  size = this._getDefaultSize(businessObject);

  attrs = assign({
    businessObject: businessObject,
    id: businessObject.id
  }, size, attrs);

  return this.baseCreate(elementType, attrs);
};


ElementFactory.prototype._getDefaultSize = function(semantic) {

  var definition = getDefinition(semantic);

  // CasePlanModel (type of semantic is 'cmmn:Stage')
  if (isCasePlanModel(semantic)) {
    return { width: 400, height: 250 };
  }

  // Stage (type of semantic is 'cmmn:PlanItem', type of definition is type 'cmmn:Stage')
  if (is(definition, 'cmmn:Stage')) {
    return { width: 350, height: 200 };
  }

  return { width: 100, height: 80 };
};


ElementFactory.prototype.createPlanItemShape = function(type) {
  return this.createShape({
    type: 'cmmn:PlanItem',
    businessObject: this._cmmnFactory.createItem('cmmn:PlanItem', type)
  });
};


ElementFactory.prototype.createCasePlanModelShape = function() {
  return this.createShape({
    type: 'cmmn:Stage',
    businessObject: this._cmmnFactory.createCasePlanModel()
  });
};
