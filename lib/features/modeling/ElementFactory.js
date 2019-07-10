'use strict';

var assign = require('min-dash').assign,
    inherits = require('inherits');

var BaseElementFactory = require('diagram-js/lib/core/ElementFactory').default,
    LabelUtil = require('../../util/LabelUtil');

var is = require('../../util/ModelUtil').is,
    getDefinition = require('../../util/ModelUtil').getDefinition,
    isCasePlanModel = require('../../util/ModelUtil').isCasePlanModel;

var isCollapsed = require('../../util/DiUtil').isCollapsed;

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

  attrs = assign({}, attrs || {});

  var size;

  var businessObject = attrs.businessObject;

  if (!businessObject) {
    if (!attrs.type) {
      throw new Error('no shape type specified');
    }

    var props = {};

    if (attrs.name) {
      assign(props, {
        name: attrs.name
      });
    }

    businessObject = this._cmmnFactory.create(attrs.type, props);
  }


  if (elementType === 'connection') {

    if (!is(businessObject, 'cmmndi:CMMNEdge')) {
      businessObject = this._cmmnFactory.createDiEdge(businessObject, [], {
        id: businessObject.id + '_di'
      });
    }

    if (!businessObject.label) {
      businessObject.label = this._cmmnFactory.createDiLabel();
    }

    attrs.type = 'cmmndi:CMMNEdge';
  }

  if (attrs.definitionType) {
    var definition = this._cmmnFactory.create(attrs.definitionType);
    businessObject.definitionRef = definition;
  }

  if (attrs.sentryRef) {
    businessObject.sentryRef = attrs.sentryRef;
  }

  if (elementType === 'shape' && !businessObject.di) {
    businessObject.di = this._cmmnFactory.createDiShape(businessObject, {}, {
      id: businessObject.id + '_di'
    });
  }

  if (attrs.isCollapsed) {
    businessObject.di.isCollapsed = attrs.isCollapsed;
  }

  if (attrs.isPlanningTableCollapsed) {
    businessObject.di.isPlanningTableCollapsed = attrs.isPlanningTableCollapsed;
  }

  if (attrs.isStandardEventVisible) {
    businessObject.isStandardEventVisible = attrs.isStandardEventVisible;
  }

  if (attrs.isBlocking !== undefined) {
    businessObject.definitionRef.isBlocking = attrs.isBlocking;
  }

  if (attrs.autoComplete) {
    businessObject.definitionRef.autoComplete = true;
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

  if (is(definition, 'cmmn:PlanFragment')) {
    if (isCollapsed(semantic)) {
      return { width: 100, height: 80 };
    }
    else {
      return { width: 350, height: 200 };
    }
  }

  if (is(definition, 'cmmn:Milestone')) {
    return { width: 100, height: 40 };
  }

  if (is(definition, 'cmmn:EventListener')) {
    return { width: 36, height: 36 };
  }

  if (is(semantic, 'cmmn:Criterion')) {
    return { width: 20, height: 28 };
  }

  if (is(semantic, 'cmmn:TextAnnotation')) {
    return { width: 100, height: 30 };
  }

  if (is(semantic, 'cmmn:CaseFileItem')) {
    return { width: 36, height: 50 };
  }

  return { width: 100, height: 80 };
};


ElementFactory.prototype.createPlanItemShape = function(type) {
  return this.createShape({
    type: 'cmmn:PlanItem',
    businessObject: this._cmmnFactory.createItem('cmmn:PlanItem', type)
  });
};


ElementFactory.prototype.createDiscretionaryItemShape = function(type) {
  return this.createShape({
    type: 'cmmn:DiscretionaryItem',
    businessObject: this._cmmnFactory.createItem('cmmn:DiscretionaryItem', type)
  });
};


ElementFactory.prototype.createCasePlanModelShape = function() {
  return this.createShape({
    type: 'cmmn:Stage',
    businessObject: this._cmmnFactory.createCasePlanModel()
  });
};


ElementFactory.prototype.createCriterionShape = function(type) {
  return this.createShape({
    type: type,
    businessObject: this._cmmnFactory.createCriterion(type)
  });
};


ElementFactory.prototype.createCaseFileItemShape = function() {
  return this.createShape({
    type: 'cmmn:CaseFileItem',
    businessObject: this._cmmnFactory.createCaseFileItem()
  });
};
