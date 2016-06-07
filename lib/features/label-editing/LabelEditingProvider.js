'use strict';

var UpdateLabelHandler = require('./cmd/UpdateLabelHandler');

var LabelUtil = require('./LabelUtil');

var isCasePlanModel = require('../../util/ModelUtil').isCasePlanModel,
    is = require('../../util/ModelUtil').is,
    getDefinition = require('../../util/ModelUtil').getDefinition;


// default mininum bounds
var MIN_BOUNDS = {
  width: 150,
  height: 50
};

function LabelEditingProvider(eventBus, canvas, directEditing, commandStack) {

  directEditing.registerProvider(this);
  commandStack.registerHandler('element.updateLabel', UpdateLabelHandler);

  // listen to dblclick on non-root elements
  eventBus.on('element.dblclick', function(event) {
    directEditing.activate(event.element);
  });

  // complete on followup canvas operation
  eventBus.on([ 'element.mousedown', 'drag.init', 'canvas.viewbox.changed' ], function(event) {
    directEditing.complete();
  });

  // cancel on command stack changes
  eventBus.on([ 'commandStack.changed' ], function() {
    directEditing.cancel();
  });

  if ('ontouchstart' in document.documentElement) {
    // we deactivate automatic label editing on mobile devices
    // as it breaks the user interaction workflow

    // TODO(nre): we should temporarily focus the edited element here
    // and release the focused viewport after the direct edit operation is finished
  } else {
    eventBus.on('create.end', 500, function(e) {

      var element = e.shape,
          canExecute = e.context.canExecute;

      if (!canExecute) {
        return;
      }

      directEditing.activate(element);

    });
  }

  this._canvas = canvas;
  this._commandStack = commandStack;
}

LabelEditingProvider.$inject = [ 'eventBus', 'canvas', 'directEditing', 'commandStack' ];

module.exports = LabelEditingProvider;


LabelEditingProvider.prototype.activate = function(element) {

  var text = LabelUtil.getLabel(element);

  if (text === undefined) {
    return;
  }

  // don't activate for root element
  if (!element.parent) {
    return;
  }

  var definition = getDefinition(element);

  var bbox = this.getEditingBBox(element);

  // adjust bbox for case plan models
  if (isCasePlanModel(element)) {
    bbox.height = 50;
    bbox.width = 200;
    bbox.y -= 30;
  }

  // set smaller height for Stages and Plan Fragments
  if (is(definition, 'cmmn:PlanFragment')) {
    bbox.height = 50;
  }

  var minWidth = MIN_BOUNDS.width,
      minHeight = MIN_BOUNDS.height;

  // reduce min width for tasks
  if (is(definition, 'cmmn:Task')) {
    minWidth = 100;
  }

  // set min width
  if (bbox.width < minWidth) {
    bbox.x += bbox.width / 2 - minWidth / 2;
    bbox.width = minWidth;
  }

  // set min height
  if (bbox.height < minHeight) {
    bbox.height = minHeight;
  }

  return { bounds: bbox, text: text };
};


LabelEditingProvider.prototype.getEditingBBox = function(element, maxBounds) {

  var target = element.label || element;

  var bbox = this._canvas.getAbsoluteBBox(target);

  return bbox;
};


LabelEditingProvider.prototype.update = function(element, newLabel) {
  this._commandStack.execute('element.updateLabel', {
    element: element,
    newLabel: newLabel
  });
};
