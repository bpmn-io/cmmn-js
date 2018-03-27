'use strict';

var map = require('min-dash').map,
    assign = require('min-dash').assign,
    pick = require('min-dash').pick;

var isAny = require('./util/ModelingUtil').isAny;

function CmmnFactory(moddle) {
  this._model = moddle;
}

CmmnFactory.$inject = [ 'moddle' ];


CmmnFactory.prototype._needsId = function(element) {
  return isAny(element, [
    'cmmn:CMMNElement',
    'cmmndi:CMMNShape',
    'cmmndi:CMMNEdge',
    'cmmndi:CMMNStyle',
    'cmmndi:CMMNDiagram'
  ]);
};

CmmnFactory.prototype._ensureId = function(element) {
  // generate semantic ids for elements
  var prefix = (element.$type || '').replace(/^[^:]*:/g, '') + '_';

  if (!element.id && this._needsId(element)) {
    element.id = this._model.ids.nextPrefixed(prefix, element);
  }
};


CmmnFactory.prototype.create = function(type, attrs) {
  var element = this._model.create(type, attrs || {});

  this._ensureId(element);

  return element;
};


CmmnFactory.prototype.createDiLabel = function() {
  return this.create('cmmndi:CMMNLabel');
};


CmmnFactory.prototype.createDiShape = function(semantic, bounds, attrs) {
  return this.create('cmmndi:CMMNShape', assign({
    cmmnElementRef: semantic,
    bounds: this.createDiBounds(bounds),
    label: this.createDiLabel()
  }, attrs));
};


CmmnFactory.prototype.createDiEdge = function(semantic, waypoints, attrs) {
  return this.create('cmmndi:CMMNEdge', assign({
    cmmnElementRef: semantic,
    label: this.createDiLabel()
  }, attrs));
};


CmmnFactory.prototype.createDiBounds = function(bounds) {
  return this.create('dc:Bounds', bounds);
};


CmmnFactory.prototype.createDiWaypoints = function(waypoints) {

  var self = this;

  return map(waypoints, function(pos) {
    return self.createDiWaypoint(pos);
  });
};


CmmnFactory.prototype.createDiWaypoint = function(point) {
  return this.create('dc:Point', pick(point, [ 'x', 'y' ]));
};


CmmnFactory.prototype.createItem = function(itemType, definitionType) {

  var definition = this.create(definitionType);

  return this.create(itemType, {
    definitionRef: definition
  });
};


CmmnFactory.prototype.createCriterion = function(criterionType, attrs) {

  attrs = attrs || {};

  if (!attrs.sentryRef) {
    attrs = assign({
      sentryRef: this.createSentry()
    }, attrs);
  }

  return this.create(criterionType, attrs);
};


CmmnFactory.prototype.createSentry = function(attrs) {
  return this.create('cmmn:Sentry', attrs);
};


CmmnFactory.prototype.createCasePlanModel = function() {

  var casePlanModel = this.create('cmmn:Stage');

  // overwrite generated id to 'CasePlanModel_...'
  this._model.ids.unclaim(casePlanModel.id);
  casePlanModel.id = this._model.ids.nextPrefixed('CasePlanModel_', casePlanModel);

  var _case = this.create('cmmn:Case', {
    casePlanModel: casePlanModel
  });

  casePlanModel.$parent = _case;

  return casePlanModel;

};


CmmnFactory.prototype.createCaseFileModel = function(_case) {

  var caseFileModel = this.create('cmmn:CaseFile');

  // overwrite generated id to 'CaseFileModel_...'
  this._model.ids.unclaim(caseFileModel.id);
  caseFileModel.id = this._model.ids.nextPrefixed('CaseFileModel_', caseFileModel);

  caseFileModel.$parent = _case;

  return caseFileModel;

};


CmmnFactory.prototype.createCaseFileItem = function(attrs) {

  attrs = attrs || {};

  if (!attrs.definitionRef) {

    attrs = assign({
      definitionRef: this.create('cmmn:CaseFileItemDefinition')
    }, attrs);

  }

  return this.create('cmmn:CaseFileItem', attrs);

};

module.exports = CmmnFactory;
