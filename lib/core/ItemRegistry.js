'use strict';

var ModelUtil = require('../util/ModelUtil'),
    getDefinition = ModelUtil.getDefinition,
    getSentry = ModelUtil.getSentry;

var isAny = require('../features/modeling/util/ModelingUtil').isAny;

var forEach = require('min-dash').forEach,
    isArray = require('min-dash').isArray;


/**
 * @class
 *
 * A registry that keeps track of all items in the model.
 */
function ItemRegistry(elementRegistry, eventBus) {
  this._items = {};
  this._referencedBy = {};

  this._elementRegistry = elementRegistry;
  this._eventBus = eventBus;

  this._init();
}

ItemRegistry.$inject = [ 'elementRegistry', 'eventBus' ];

module.exports = ItemRegistry;


ItemRegistry.prototype._init = function(config) {

  var eventBus = this._eventBus;

  eventBus.on('diagram.destroy', 500, this._clear, this);
  eventBus.on('diagram.clear', 500, this._clear, this);
};

ItemRegistry.prototype._clear = function() {
  this._items = {};
  this._referencedBy = {};
};

/**
 * Register a given item.
 *
 * @param {ModdleElement} item
 */
ItemRegistry.prototype.add = function(item) {

  var items = this._items,
      id = item.id,
      definitions = this._referencedBy,
      definition = getReference(item),
      definitionId = definition && definition.id;

  items[id] = item;

  if (definition) {
    definitions[definitionId] = definitions[definitionId] || [];

    if (definitions[definitionId].indexOf(item) === -1) {
      definitions[definitionId].push(item);
    }

  }

};


/**
 * Removes an item from the registry.
 *
 * @param {ModdleElement} item
 */
ItemRegistry.prototype.remove = function(item) {

  var items = this._items,
      id = item.id,
      definitions = this._referencedBy,
      definition = getReference(item),
      definitionId = definition && definition.id;

  delete items[id];

  if (definition) {

    var referencingItems = definitions[definitionId] || [],
        idx = referencingItems.indexOf(item);

    if (idx !== -1) {
      referencingItems.splice(idx, 1);
    }

    if (!referencingItems.length) {
      delete definitions[definitionId];
    }

  }

};


/**
 * Update the registration with the new id.
 *
 * @param {ModdleElement} item
 * @param {String} newId
 */
ItemRegistry.prototype.updateId = function(element, newId) {

  var items,
      item;

  if (typeof element === 'string') {
    element = this.get(element);
  }

  if (isDefinition(element)) {
    items = this._referencedBy;
  }
  else {
    items = this._items;
  }

  if (element) {

    item = items[element.id];

    delete items[element.id];

    items[newId] = item;

  }

};


/**
 * Update the registration.
 *
 * @param {ModdleElement} item
 * @param {ModdleElement} newReference
 */
ItemRegistry.prototype.updateReference = function(item, newReference) {

  var definitions = this._referencedBy,
      oldDefinition = getReference(item),
      oldDefinitionId = oldDefinition && oldDefinition.id;

  if (oldDefinition) {

    var referencingItems = definitions[oldDefinitionId] || [],
        idx = referencingItems.indexOf(item);

    if (idx !== -1) {
      referencingItems.splice(idx, 1);
    }

    if (!referencingItems.length) {
      delete definitions[oldDefinitionId];
    }

  }

  if (newReference) {

    var newReferenceId = newReference.id;
    if (newReferenceId) {

      definitions[newReferenceId] = definitions[newReferenceId] || [];

      if (definitions[newReferenceId].indexOf(item) === -1) {
        definitions[newReferenceId].push(item);
      }

    }

  }

};


/**
 * Return the item for a given id.
 *
 * @param {String} id for selecting the item
 *
 * @return {ModdleElement}
 */
ItemRegistry.prototype.get = function(id) {
  return this._items[id];
};


/**
 * Return all items that match a given filter function.
 *
 * @param {Function} fn
 *
 * @return {Array<ModdleElement>}
 */
ItemRegistry.prototype.filter = function(fn) {

  var filtered = [];

  this.forEach(function(element, definition) {
    if (fn(element, definition)) {
      filtered.push(element);
    }
  });

  return filtered;

};


/**
 * Return all items.
 *
 * @return {Array<ModdleElement>}
 */
ItemRegistry.prototype.getAll = function() {
  return this.filter(function(e) { return e; });
};


/**
 * Iterate over all items.
 *
 * @param {Function} fn
 */
ItemRegistry.prototype.forEach = function(fn) {

  var items = this._items;

  forEach(items, function(item) {
    return fn(item, getReference(item));
  });

};


/**
 * Return for given definition all referenced items.
 *
 * @param {String|ModdleElement} filter
 */
ItemRegistry.prototype.getReferences = function(filter) {
  var id = filter.id || filter;
  return (this._referencedBy[id] || []).slice();
};


/**
 * Return for a given item id the shape element.
 *
 * @param {String|ModdleElement} filter
 */
ItemRegistry.prototype.getShape = function(filter) {
  var id = filter.id || filter;
  return this._elementRegistry && this._elementRegistry.get(id);
};


/**
 * Return for a given filter all shapes.
 *
 * @param {Array<String>|String|ModdleElement} filter
 */
ItemRegistry.prototype.getShapes = function(filter) {

  var shapes = [],
      self = this;

  function add(shape) {
    shape && shapes.push(shape);
  }

  if (isArray(filter)) {

    forEach(filter, function(f) {
      add(self.getShape(f));
    });

  }
  else if (isDefinition(filter)) {

    var referencedBy = self.getReferences(filter);
    forEach(referencedBy, function(reference) {
      add(self.getShape(reference));
    });

  }
  else {
    add(self.getShape(filter));
  }

  return shapes;

};


function getReference(item) {
  return getDefinition(item) || getSentry(item);
}

function isDefinition(item) {
  return isAny(item, [
    'cmmn:PlanItemDefinition',
    'cmmn:Sentry',
    'cmmn:CaseFileItemDefinition'
  ]);
}