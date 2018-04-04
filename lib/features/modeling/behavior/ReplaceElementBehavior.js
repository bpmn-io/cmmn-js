'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor').default;

var saveClear = require('diagram-js/lib/util/Removal').saveClear;

var ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    getDefinition = ModelUtil.getDefinition,
    getSentry = ModelUtil.getSentry;

var forEach = require('min-dash').forEach,
    filter = require('min-dash').filter,
    assign = require('min-dash').assign;

var HIGH_PRIORITY = 6000,
    LOW_PRIORITY = 500,
    VERY_LOW_PRIORITY = 100;


function ReplaceElementBehavior(
    cmmnReplace,
    cmmnRules,
    elementFactory,
    elementRegistry,
    eventBus,
    modeling,
    selection,
    rules
) {

  CommandInterceptor.call(this, eventBus);

  this._cmmnReplace = cmmnReplace;
  this._cmmnRules = cmmnRules;
  this._elementFactory = elementFactory;
  this._elementRegistry = elementRegistry;
  this._modeling = modeling;
  this._selection = selection;
  this._rules = rules;

  var self = this;


  function canConnect(source, target) {

    return rules.allowed('connection.create', {
      source: source,
      target: target
    });

  }

  function canReconnect(type, attrs) {
    return rules.allowed(type, attrs);
  }


  // SHAPES //////////////////////////////////////////////////////////////////

  this.preExecute([ 'shape.create', 'shape.append' ], HIGH_PRIORITY, function(context) {

    var shape = context.shape,
        source = context.source,
        target = context.parent || context.target || (source && source.parent),
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

      var canReplace = cmmnRules.canReplace([ shape ], target, position, source);

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

      if (canReplace && canReplace.replacements) {
        self.replaceElements(elements, canReplace.replacements);
      }

    }

  }, true);


  this.postExecuted([ 'shape.replace' ], 1500, function(e) {
    var context = e.context,
        oldShape = context.oldShape,
        newShape = context.newShape;

    modeling.unclaimId(oldShape.businessObject.id, oldShape.businessObject);
    modeling.updateProperties(newShape, { id: oldShape.id });
  });


  // CONNECTIONS /////////////////////////////////////////////////////////////////////

  this.preExecute('connection.create', HIGH_PRIORITY, function(context) {

    var source = context.source,
        target = context.target,
        canReplace = context.canExecute || canConnect(source, target);

    if (canReplace && canReplace.replacements) {

      var replacements = self.replaceElements([ source, target ], canReplace.replacements, {
        select: false
      });

      context.source = replacements[source.id] || context.source;
      context.target = replacements[target.id] || context.target;

      // remember replaced by element in canReplace object (see 'connect.end')
      assign(canReplace, {
        replacedBy: !canReplace.reverse ? context.target : context.source
      });

    }

  }, true);


  eventBus.on('connect.end', LOW_PRIORITY + VERY_LOW_PRIORITY, function(e) {

    var canExecute = e.context.canExecute,
        replacedBy = canExecute && canExecute.replacedBy;

    // if target shape has been replaced, then select the
    // new element and not the old target.
    if (replacedBy) {
      e.context.target = replacedBy;
    }

  });


  this.preExecute([
    'connection.reconnectStart',
    'connection.reconnectEnd'
  ], HIGH_PRIORITY, function(event) {

    var type = event.command,
        isReconnectStart = (type === 'connection.reconnectStart'),
        context = event.context,
        connection = context.connection,
        source = context.newSource || connection.source,
        target = context.newTarget || connection.target,
        attrs = { connection: connection },
        canReplace;

    if (context.hints && context.hints.nested) {
      return;
    }

    attrs[ isReconnectStart ? 'hover' : 'source' ] = source;
    attrs[ !isReconnectStart ? 'hover' : 'target' ] = target;

    canReplace = canReconnect(type, attrs);

    if (canReplace && canReplace.replacements) {
      var replacements = self.replaceElements([ source, target ], canReplace.replacements, {
        select: false
      });

      context.newSource = replacements[source.id] || context.newSource;
      context.newTarget = replacements[target.id] || context.newTarget;
    }

    // remember result in context, so that this can be re-used
    context.canExecute = canReplace;

  });


  this.preExecute('shape.delete', HIGH_PRIORITY, function(context) {

    var shape = context.shape,
        parent = isCriterion(shape) ? shape.host : shape.parent,
        definition = getDefinition(parent);

    // if the shape to delete is contained by a plan fragment (and not stage)
    // then remove incoming connections. Thereby an additional hint is provided
    // to the context, so that shape delete is not replaced when the connection
    // is deleted.

    if (is(definition, 'cmmn:Stage')) {
      return;
    }

    saveClear(shape.incoming, function(connection) {
      modeling.removeConnection(connection, { nested: true, endChanged: true });
    });

  }, true);


  this.postExecuted([
    'connection.delete',
    'connection.reconnectEnd'
  ], LOW_PRIORITY, function(context) {

    var shape = context.target || context.oldTarget,
        elements = [ shape ],
        target = isCriterion(shape) ? shape.host : shape.parent,
        hints = context.hints || {};

    if (hints.endChanged) {
      return;
    }

    if (target && !cmmnRules.canMove(elements, target)) {

      var canReplace = cmmnRules.canReplace(elements, target);

      if (canReplace && canReplace.replacements) {
        self.replaceElements(elements, canReplace.replacements, { select: false });
      }

    }

  }, true);


  // PROPERTIES /////////////////////////////////////////////////////////////////////

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


  // API ///////////////////////////////////////////////////////////////////////////

  this.replaceElements = function(elements, newElements, hints) {

    var self = this;

    var elementRegistry = this._elementRegistry,
        selection = this._selection;

    var executedReplacements = {};

    hints = hints || {};

    forEach(newElements, function(replacement) {

      var oldElement = elementRegistry.get(replacement.oldElementId),
          idx = elements.indexOf(oldElement),
          replacedBy;

      if (!oldElement) {
        return;
      }

      replacedBy = self.replaceElement(oldElement, replacement);

      if (idx !== -1) {
        elements[idx] = replacedBy;
      }

      executedReplacements[oldElement.id] = replacedBy;

    });

    if (newElements && hints.select !== false) {
      selection.select(elements);
    }

    return executedReplacements;

  };


  this.replaceElement = function(element, replacement) {

    var cmmnReplace = this._cmmnReplace;

    var definition = getDefinition(element),
        definitionType = replacement.newDefinitionType || (definition && definition.$type);

    if (!element) {
      return;
    }

    var newElement = {
      type: replacement.newElementType
    };

    if (definitionType) {
      assign(newElement, {
        definitionType: definitionType
      });
    }

    return cmmnReplace.replaceElement(element, newElement, { select: false });

  };

}


ReplaceElementBehavior.$inject = [
  'cmmnReplace',
  'cmmnRules',
  'elementFactory',
  'elementRegistry',
  'eventBus',
  'modeling',
  'selection',
  'rules'
];

inherits(ReplaceElementBehavior, CommandInterceptor);

module.exports = ReplaceElementBehavior;


function isCriterion(element) {
  return is(element, 'cmmn:Criterion');
}
