'use strict';

var map = require('lodash/collection/map'),
    assign = require('lodash/object/assign'),
    pick = require('lodash/object/pick');


function CmmnFactory(moddle) {
  this._model = moddle;
}

CmmnFactory.$inject = [ 'moddle' ];


CmmnFactory.prototype._needsId = function(element) {
  return true;
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
  return this.create('cmmndi:CMMNLabel', {
    bounds: this.createDiBounds()
  });
};


CmmnFactory.prototype.createDiShape = function(semantic, bounds, attrs) {
  return this.create('cmmndi:CMMNShape', assign({
    cmmnElementRef: semantic,
    bounds: this.createDiBounds(bounds)
  }, attrs));
};


CmmnFactory.prototype.createDiEdge = function(semantic, waypoints, attrs) {
  return this.create('cmmndi:CMMNEdge', assign({
    cmmnElementRef: semantic
  }, attrs));
};


CmmnFactory.prototype.createDiBounds = function(bounds) {
  return this.create('dc:Bounds', bounds);
};


CmmnFactory.prototype.createDiWaypoints = function(waypoints) {
  return map(waypoints, function(pos) {
    return this.createDiWaypoint(pos);
  }, this);
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

module.exports = CmmnFactory;
