'use strict';

var assign = require('min-dash').assign,
    map = require('min-dash').map;

var LabelUtil = require('../util/LabelUtil');

var is = require('../util/ModelUtil').is;

var hasExternalLabel = LabelUtil.hasExternalLabel,
    getExternalLabelBounds = LabelUtil.getExternalLabelBounds,
    isCollapsed = require('../util/DiUtil').isCollapsed,
    elementToString = require('./Util').elementToString;


function elementData(semantic, attrs) {
  return assign({
    id: semantic.id,
    type: semantic.$type,
    businessObject: semantic
  }, attrs);
}

function collectWaypoints(waypoints) {
  return map(waypoints, function(p) {
    return { x: p.x, y: p.y };
  });
}

function notYetDrawn(semantic, refSemantic, property) {
  return new Error(
    'element ' + elementToString(refSemantic) + ' referenced by ' +
      elementToString(semantic) + '#' + property + ' not yet drawn');
}

/**
 * An importer that adds cmmn elements to the canvas
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {ElementFactory} elementFactory
 * @param {ElementRegistry} elementRegistry
 */
function CmmnImporter(eventBus, canvas, elementFactory, elementRegistry) {
  this._eventBus = eventBus;
  this._canvas = canvas;

  this._elementFactory = elementFactory;
  this._elementRegistry = elementRegistry;
}

CmmnImporter.$inject = [ 'eventBus', 'canvas', 'elementFactory', 'elementRegistry' ];

module.exports = CmmnImporter;


/**
 * Set the diagram as root element
 */
CmmnImporter.prototype.root = function(diagram) {
  var element = this._elementFactory.createRoot(elementData(diagram));

  this._canvas.setRootElement(element);

  return element;
};


/**
 * Add cmmn element (semantic) to the canvas onto the
 * specified parent shape.
 */
CmmnImporter.prototype.add = function(semantic, parentElement) {

  var di = semantic.di,
      element,
      hidden;

  // SHAPE
  if (di && is(di, 'cmmndi:CMMNShape') && !this._getElement(semantic)) {

    var collapsed = isCollapsed(semantic);

    hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

    var bounds = semantic.di.bounds;

    element = this._elementFactory.createShape(elementData(semantic, {
      collapsed: collapsed,
      hidden: hidden,
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height)
    }));

    if (is(semantic, 'cmmn:Criterion')) {
      this._attachCriterion(semantic, element);
    }

    this._canvas.addShape(element, parentElement);
  }

  // CONNECTION
  else if ((di && is(di, 'cmmndi:CMMNEdge')) || is(semantic, 'cmmndi:CMMNEdge')) {

    var source = this._getSource(semantic),
        target = this._getTarget(semantic);

    hidden = (parentElement && (parentElement.hidden || parentElement.collapsed)) ||
                 (source && source.hidden) ||
                 (target && target.hidden) ;

    var waypoint = (semantic.di || {}).waypoint || semantic.waypoint;

    element = this._elementFactory.createConnection(elementData(semantic, {
      hidden: hidden,
      source: source,
      target: target,
      waypoints: collectWaypoints(waypoint)
    }));

    this._canvas.addConnection(element, parentElement);
  } else {
    throw new Error('unknown di ' + elementToString(di) + ' for element ' + elementToString(semantic));
  }

  // (optional) LABEL
  if (hasExternalLabel(semantic)) {
    this.addLabel(semantic, element);
  }

  this._eventBus.fire('cmmnElement.added', { element: element });

  return element;
};


/**
 * Attach the criterion element to the given host
 *
 * @param {ModdleElement} criterionSemantic
 * @param {djs.model.Base} criterionElement
 */
CmmnImporter.prototype._attachCriterion = function(criterionSemantic, criterionElement) {
  var hostSemantic = criterionSemantic.$parent;

  if (!hostSemantic) {
    throw new Error('missing ' + elementToString(criterionSemantic) + '$parent');
  }

  var host = this._elementRegistry.get(hostSemantic.id),
      attachers = host && host.attachers;

  if (!host) {
    throw notYetDrawn(criterionSemantic, hostSemantic, 'criterion');
  }

  // wire element.host <> host.attachers
  criterionElement.host = host;

  if (!attachers) {
    host.attachers = attachers = [];
  }

  if (attachers.indexOf(criterionElement) === -1) {
    attachers.push(criterionElement);
  }
};


/**
 * add label for an element
 */
CmmnImporter.prototype.addLabel = function(semantic, element) {
  var bounds = getExternalLabelBounds(semantic, element);

  var label = this._elementFactory.createLabel(elementData(semantic, {
    id: semantic.id + '_label',
    labelTarget: element,
    type: 'label',
    hidden: element.hidden,
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height)
  }));

  return this._canvas.addShape(label, element.parent);
};

CmmnImporter.prototype._getSource = function(semantic) {
  var cmmnElement = semantic.cmmnElementRef;

  if (cmmnElement) {

    if (is(cmmnElement, 'cmmn:OnPart')) {

      if (cmmnElement.exitCriterionRef) {
        return this._getEnd(cmmnElement, 'exitCriterionRef');
      }

      return this._getEnd(cmmnElement, 'sourceRef');

    }

    if (is(cmmnElement, 'cmmn:Association')) {
      return this._getEnd(cmmnElement, 'sourceRef');
    }

  }

  if (is(semantic, 'cmmndi:CMMNEdge')) {
    return this._getEnd(semantic, 'sourceCMMNElementRef');
  }

};

CmmnImporter.prototype._getTarget = function(semantic) {
  var cmmnElement = semantic.cmmnElementRef;

  if (cmmnElement) {

    if (is(cmmnElement, 'cmmn:Association')) {
      return this._getEnd(cmmnElement, 'targetRef');
    }

  }

  return this._getEnd(semantic, 'targetCMMNElementRef');
};

CmmnImporter.prototype._getEnd = function(semantic, side) {
  var refSemantic = semantic[side];
  var element = refSemantic && this._getElement(refSemantic);

  if (element) {
    return element;
  }

  if (refSemantic) {
    throw notYetDrawn(semantic, refSemantic, side);
  } else {
    throw new Error(elementToString(semantic) + '#' + side + 'Ref not specified');
  }

};

CmmnImporter.prototype._getElement = function(semantic) {
  return this._elementRegistry.get(semantic.id);
};