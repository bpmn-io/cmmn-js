'use strict';

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor').default;

var cssEscape = require('css.escape');

var inherits = require('inherits');

var assign = require('min-dash').assign,
    forEach = require('min-dash').forEach;

var getVisual = require('diagram-js/lib/util/GraphicsUtil').getVisual;

var isItemCapable = require('../modeling/util/PlanItemDefinitionUtil').isItemCapable;

var ModelUtil = require('../../util/ModelUtil'),
    getBusinessObject = ModelUtil.getBusinessObject,
    getDefinition = ModelUtil.getDefinition;

var domQuery = require('min-dom').query;

var svgAppend = require('tiny-svg').append,
    svgClasses = require('tiny-svg').classes,
    svgCreate = require('tiny-svg').create,
    svgRemove = require('tiny-svg').remove;

var LOW_PRIORITY = 250;

function CmmnReplacePreview(
    cmmnReplace,
    cmmnRules,
    elementFactory,
    elementRegistry,
    eventBus,
    graphicsFactory
) {

  CommandInterceptor.call(this, eventBus);


  function createShape(element, replacement) {

    var newElement = {
      type: replacement.newElementType,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    };

    if (isItemCapable(element)) {

      var bo = getBusinessObject(element),
          definition = getDefinition(element),
          newElementType = replacement.newElementType,
          newDefinitionType = replacement.newDefinitionType,
          replaceCandidate;

      if (newDefinitionType) {
        definition = cmmnReplace.replacePlanItemDefinition(definition, newDefinitionType);
      }

      replaceCandidate = cmmnReplace.replaceItemCapable(bo, newElementType, definition);

      assign(newElement, {
        businessObject: replaceCandidate
      });
    }

    return elementFactory.createShape(newElement);
  }


  function initVisualReplacements(context) {
    if (!context.visualReplacements) {
      context.visualReplacements = {};
    }
    return context.visualReplacements;
  }


  function canReplace(event) {
    var context = event.context,
        canExecute = context.canExecute || context.allowed;

    if (canExecute === 'attach') {
      var position = context.position || { x: event.x, y: event.y },
          shapes = context.shapes || [ context.shape ],
          target = context.target;

      canExecute = cmmnRules.canReplace(shapes, target, position, context.source);
    }


    return canExecute;
  }


  /**
   * Replace the visuals to the given shape
   */
  function replaceVisualGraphics(gfx, shape) {

    var visual = gfx && getVisual(gfx);

    if (visual) {
      svgRemove(visual);

      visual = svgCreate('g');
      svgClasses(visual).add('djs-visual');

      svgAppend(gfx, visual);

      graphicsFactory.drawShape(visual, shape);
    }

  }


  function replaceVisual(context, replacements, gfxSelector) {

    forEach(replacements, function(replacement) {

      var id = replacement.oldElementId,
          shape = elementRegistry.get(id) || context.shape;

      // if the visual of the element is already replaced
      if (context.visualReplacements[id]) {
        return;
      }

      // create a temporary shape
      var tempShape = createShape(shape, replacement);

      // select the original SVG element related to the element and hide it
      var gfx = gfxSelector(shape);

      replaceVisualGraphics(gfx, tempShape);
      context.visualReplacements[id] = shape;

    });

  }

  function restoreVisual(context, gfxSelector) {

    var visualReplacements = context.visualReplacements;

    forEach(visualReplacements, function(shape, id) {

      var gfx = gfxSelector(shape);
      replaceVisualGraphics(gfx, shape);

      delete visualReplacements[id];

    });
  }


  eventBus.on([ 'shape.move.move', 'create.move' ], LOW_PRIORITY, function(event) {

    var context = event.context,
        dragGroup = context.dragGroup,
        visual = context.visual,
        canExecute = canReplace(event),
        replacements = canExecute && canExecute.replacements;

    initVisualReplacements(context);

    var getGfx = function(shape) {
      var selector,
          gfx;

      if (dragGroup) {
        selector = '[data-element-id="' + cssEscape(shape.id) + '"]';
        gfx = dragGroup;
      }
      else if (visual) {
        selector = '.djs-dragger';
        gfx = visual;
      }

      return gfx && domQuery(selector, gfx);
    };

    if (replacements && replacements.length) {
      replaceVisual(context, replacements, getGfx);
    }
    else {
      restoreVisual(context, getGfx);
    }

  });


  eventBus.on([
    'bendpoint.move.move',
    'connect.move'
  ], LOW_PRIORITY, function(event) {

    var context = event.context,
        canExecute = canReplace(event),
        replacements = canExecute && canExecute.replacements;

    initVisualReplacements(context);

    if (replacements && replacements.length) {
      replaceVisual(context, replacements, function(shape) {
        return elementRegistry.getGraphics(shape);
      });
    }

  });


  eventBus.on([
    'bendpoint.move.cancel',
    'bendpoint.move.cleanup',
    'bendpoint.move.end',
    'bendpoint.move.out',
    'connect.cleanup',
    'connect.end',
    'connect.out'
  ], LOW_PRIORITY, function(event) {

    var context = event.context;

    restoreVisual(context, function(shape) {
      return elementRegistry.getGraphics(shape);
    });

  });

}

CmmnReplacePreview.$inject = [
  'cmmnReplace',
  'cmmnRules',
  'elementFactory',
  'elementRegistry',
  'eventBus',
  'graphicsFactory'
];

inherits(CmmnReplacePreview, CommandInterceptor);

module.exports = CmmnReplacePreview;
