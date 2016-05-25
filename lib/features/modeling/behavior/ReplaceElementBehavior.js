'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');
var saveClear = require('diagram-js/lib/util/Removal').saveClear;

var ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    getDefinition = ModelUtil.getDefinition,
    getSentry = ModelUtil.getSentry;

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter'),
    assign = require('lodash/object/assign');

var HIGH_PRIORITY = 5000,
    LOW_PRIORITY = 500;

function ReplaceElementBehavior(
  cmmnReplace,
  cmmnRules,
  elementFactory,
  elementRegistry,
  eventBus,
  modeling,
  selection
) {

  CommandInterceptor.call(this, eventBus);

  this._cmmnReplace = cmmnReplace;
  this._cmmnRules = cmmnRules;
  this._elementFactory = elementFactory;
  this._elementRegistry = elementRegistry;
  this._modeling = modeling;
  this._selection = selection;

  var self = this;


  this.preExecute('shape.replace', HIGH_PRIORITY, function(context) {

    var oldShape = context.oldShape,
        parent = oldShape.parent,
        newData = context.newData;

    var position = {
      x: newData.x,
      y: newData.y
    };

    context.newShape = context.newShape || modeling.createShape(newData, position, parent, {
      nested: true
    });

  }, true);


  this.preExecute('shape.create', HIGH_PRIORITY, function(context) {

    var shape = context.shape,
        source = context.source,
        target = context.parent || (source && source.parent),
        host = context.host,
        position = context.position,
        hints = context.hints || {};

    if (hints.nested) {
      return;
    }

    if (host && isCriterion(shape)) {
      target = host;
    }

    if (!cmmnRules.canCreate(shape, target, source, position)) {

      var canReplace = cmmnRules.canReplace([ shape ], target, position);

      if (canReplace && canReplace.replacements) {

        var replacement = canReplace.replacements[0],
            definition = getDefinition(shape),
            sentry = getSentry(shape),
            elementType = replacement.newElementType,
            definitionType = replacement.newDefinitionType || (definition && definition.$type);

        var attrs = assign({}, {
          type: elementType
        });

        if (definitionType) {
          assign(attrs, {
            definitionType: definitionType
          });
        }

        if (sentry) {
          assign(attrs, {
            sentryRef: sentry
          });
        }

        context.shape = elementFactory.createShape(attrs);

      }

    }

  }, true);


  this.postExecuted('elements.move', LOW_PRIORITY, function(context) {

    var target = context.newParent,
        newHost = context.newHost,
        elements = context.shapes.slice();

    if (elements.length === 1 && newHost) {
      target = newHost;
    }
    else {
      elements = filter(elements, function(elem) {
        return !isCriterion(elem);
      });
    }

    if (target && !cmmnRules.canMove(elements, target)) {

      var canReplace = cmmnRules.canReplace(elements, target);

      if (canReplace) {
        self.replaceElements(elements, canReplace.replacements);
      }
      
    }

  }, true);


  this.preExecute('shape.delete', HIGH_PRIORITY, function(context) {

    var shape = context.shape,
        parent = isCriterion(shape) ? shape.host : shape.parent,
        definition = getDefinition(parent);

    if (is(definition, 'cmmn:Stage')) {
      return;
    }

    // remove incoming connections and provide an additional hint
    // so that the shape to delete is not replaced
    saveClear(shape.incoming, function(connection) {
      modeling.removeConnection(connection, { nested: true, removingTarget: true });
    });

  }, true);


  this.postExecuted('connection.delete', LOW_PRIORITY, function(context) {

    var shape = context.target,
        elements = [ shape ],
        target = isCriterion(shape) ? shape.host : shape.parent,
        hints = context.hints || {};

    if (hints.removingTarget) {
      return;
    }

    if (target && !cmmnRules.canMove(elements, target)) {

      var canReplace = cmmnRules.canReplace(elements, target);

      if (canReplace) {
        self.replaceElements(elements, canReplace.replacements, { select: false });
      }
      
    }

  }, true);


  this.postExecuted('element.updateProperties', function(context) {

    var properties = context.properties,
        changed = context.changed;

    if (properties && properties.isBlocking === false) {

      forEach(changed, function(shape) {

        var attachers = shape.attachers,
            canReplace = cmmnRules.canReplace(attachers, shape);

        if (canReplace) {
          self.replaceElements(attachers, canReplace.replacements, { select: false });
        }
      });

    }

  }, true);


  this.replaceElements = function(elements, newElements, hints) {

    var elementRegistry = this._elementRegistry,
        cmmnReplace = this._cmmnReplace,
        selection = this._selection;

    hints = hints || {};

    forEach(newElements, function(replacement) {

      var oldElement = elementRegistry.get(replacement.oldElementId),
          idx = elements.indexOf(oldElement),
          definition = getDefinition(oldElement),
          definitionType = replacement.newDefinitionType || (definition && definition.$type);

      var newElement = {
        type: replacement.newElementType
      };

      if (definitionType) {
        assign(newElement, {
          definitionType: definitionType
        });
      }

      elements[idx] = cmmnReplace.replaceElement(oldElement, newElement, { select: false });

    });

    if (newElements && hints.select !== false) {
      selection.select(elements);
    }
  };

}


ReplaceElementBehavior.$inject = [
  'cmmnReplace',
  'cmmnRules',
  'elementFactory',
  'elementRegistry',
  'eventBus',
  'modeling',
  'selection'
];

inherits(ReplaceElementBehavior, CommandInterceptor);

module.exports = ReplaceElementBehavior;


function isCriterion(element) {
  return is(element, 'cmmn:Criterion');
}
