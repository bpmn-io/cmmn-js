'use strict';

var assign = require('lodash/object/assign'),
    isArray = require('lodash/lang/isArray');


/**
 * A provider for CMMN 1.1 elements context pad
 */
function ContextPadProvider(contextPad, modeling, rules, popupMenu, canvas) {

  contextPad.registerProvider(this);

  this._contextPad = contextPad;
  this._modeling = modeling;
  this._rules = rules;
  this._popupMenu = popupMenu;
  this._canvas = canvas;
}

ContextPadProvider.$inject = [
  'contextPad',
  'modeling',
  'rules',
  'popupMenu',
  'canvas'
];
module.exports = ContextPadProvider;


ContextPadProvider.prototype.getContextPadEntries = function(element) {

  var contextPad = this._contextPad,
      modeling = this._modeling,
      canvas = this._canvas,
      rules = this._rules,
      popupMenu = this._popupMenu;

  var actions = {};

  if (element.type === 'label') {
    return actions;
  }


  function removeElement(e) {
    modeling.removeElements([ element ]);
  }

  function getReplaceMenuPosition(element) {

    var Y_OFFSET = 5;

    var diagramContainer = canvas.getContainer(),
        pad = contextPad.getPad(element).html;

    var diagramRect = diagramContainer.getBoundingClientRect(),
        padRect = pad.getBoundingClientRect();

    var top = padRect.top - diagramRect.top;
    var left = padRect.left - diagramRect.left;

    var pos = {
      x: left,
      y: top + padRect.height + Y_OFFSET
    };

    return pos;
  }


  var replaceMenu;

  if (popupMenu._providers['cmmn-replace']) {
    replaceMenu = popupMenu.create('cmmn-replace', element);
  }

  if (replaceMenu && !replaceMenu.isEmpty()) {

    // Replace menu entry
    assign(actions, {
      'replace': {
        group: 'edit',
        className: 'cmmn-icon-screw-wrench',
        title: 'Change type',
        action: {
          click: function(event, element) {
            replaceMenu.open(assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y }
            }), element);
          }
        }
      }
    });
  }


  // delete element entry, only show if allowed by rules
  var deleteAllowed = rules.allowed('elements.delete', { elements: [ element ]});

  if (isArray(deleteAllowed)) {
    // was the element returned as a deletion candidate?
    deleteAllowed = deleteAllowed[0] === element;
  }

  if (deleteAllowed) {
    assign(actions, {
      'delete': {
        group: 'edit',
        className: 'cmmn-icon-trash',
        title: 'Remove',
        action: {
          click: removeElement,
          dragstart: removeElement
        }
      }
    });
  }

  return actions;
};
