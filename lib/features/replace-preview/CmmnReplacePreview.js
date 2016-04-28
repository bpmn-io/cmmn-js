'use strict';

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var inherits = require('inherits');

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach');

var getVisual = require('diagram-js/lib/util/GraphicsUtil').getVisual;

var LOW_PRIORITY = 250;

function CmmnReplacePreview(
  eventBus,
  elementRegistry,
  elementFactory,
  canvas,
  moveVisuals,
  cmmnRules,
  graphicsFactory
) {

  this._cmmnRules = cmmnRules;

  var self = this;

  CommandInterceptor.call(this, eventBus);


  function createShape(element) {
    return elementFactory.createShape(element);
  }


  function initVisualReplacements(context) {
    if (!context.visualReplacements) {
      context.visualReplacements = {};
    }
    return context.visualReplacements;
  }


  function canReplace(event) {
    var context = event.context,
        canExecute = context.canExecute;

    if (canExecute === 'attach') {
      var position = context.position || { x: event.x, y: event.y },
          shapes = context.shapes || [ context.shape ],
          target = context.target;

      canExecute = self._cmmnRules.canReplace(shapes, target, position);
    }


    return canExecute;
  }


  /**
   * Replace the visuals to the given shape
   */
  function replaceVisualGraphics(gfx, shape) {

    var dragger = gfx.select('.djs-dragger'),
        visual = getVisual(gfx);

    if (visual) {
      visual.remove();
      visual = dragger.group().addClass('djs-visual');    
      graphicsFactory.drawShape(visual, shape);
    }

  }


  /**
   * Replace the visuals of the element in the context which can be replaced
   *
   * @param  {Object} context
   */
  function replaceVisualOnCreate(context, replacements) {

    var id = context.shape.id;

    context.visualReplacements[id] = true;

    var replacement = replacements[0],
        newShape;

    var newElement = {
      type: replacement.newElementType
    };

    newShape = createShape(newElement);

    replaceVisualGraphics(context.visual, newShape);

  }

  /**
   * Restore the original visuals of the previously replaced element
   *
   * @param  {Object} context
   */
  function restoreVisualOnCreate(context) {

    var shape = context.shape,
        id = shape.id;

    delete context.visualReplacements[id];

    replaceVisualGraphics(context.visual, shape);
  }


  /**
   * Replace the visuals of all elements in the context which can be replaced
   *
   * @param  {Object} context
   */
  function replaceVisualOnMove(context, replacements) {

    forEach(replacements, function(replacement) {

      var id = replacement.oldElementId;

      var newElement = {
        type: replacement.newElementType
      };

      // if the visual of the element is already replaced
      if (context.visualReplacements[id]) {
        return;
      }

      var element = elementRegistry.get(id);

      assign(newElement, { x: element.x, y: element.y });

      // create a temporary shape
      var tempShape = createShape(newElement);

      canvas.addShape(tempShape, element.parent);

      // select the original SVG element related to the element and hide it
      var gfx = context.dragGroup.select('[data-element-id=' + element.id + ']');

      if (gfx) {
        gfx.attr({ display: 'none' });
      }

      // clone the gfx of the temporary shape and add it to the drag group
      var dragger = moveVisuals.addDragger(context, tempShape);

      context.visualReplacements[id] = dragger;

      canvas.removeShape(tempShape);
    });
  }


  /**
   * Restore the original visuals of the previously replaced elements
   *
   * @param  {Object} context
   */
  function restoreVisualOnMove(context) {

    var visualReplacements = context.visualReplacements;

    forEach(visualReplacements, function(dragger, id) {

      var originalGfx = context.dragGroup.select('[data-element-id=' + id + ']');

      if (originalGfx) {
        originalGfx.attr({ display: 'inline' });
      }

      dragger.remove();

      if (visualReplacements[id]) {
        delete visualReplacements[id];
      }
    });
  }


  var handler = {
    replace: {
      'create.move': replaceVisualOnCreate,
      'shape.move.move': replaceVisualOnMove
    },
    restore: {
      'create.move': restoreVisualOnCreate,
      'shape.move.move': restoreVisualOnMove
    }
  };


  eventBus.on([ 'create.move', 'shape.move.move' ], LOW_PRIORITY, function(event) {

    var type = event.type,
        context = event.context,
        canExecute = canReplace(event);

    initVisualReplacements(context);

    if (canExecute && canExecute.replacements) {
      handler.replace[type](context, canExecute.replacements);
    } else {
      handler.restore[type](context);
    }

  });
}

CmmnReplacePreview.$inject = [
  'eventBus',
  'elementRegistry',
  'elementFactory',
  'canvas',
  'moveVisuals',
  'cmmnRules',
  'graphicsFactory'
];

inherits(CmmnReplacePreview, CommandInterceptor);

module.exports = CmmnReplacePreview;
