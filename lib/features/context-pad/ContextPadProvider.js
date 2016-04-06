'use strict';

var assign = require('lodash/object/assign'),
    isArray = require('lodash/lang/isArray');


/**
 * A provider for CMMN 1.1 elements context pad
 */
function ContextPadProvider(contextPad, modeling, rules) {

  contextPad.registerProvider(this);

  this._contextPad = contextPad;
  this._modeling = modeling;
  this._rules = rules;
}

ContextPadProvider.$inject = [ 'contextPad', 'modeling', 'rules' ];

module.exports = ContextPadProvider;


ContextPadProvider.prototype.getContextPadEntries = function(element) {

  var modeling = this._modeling,
      rules = this._rules;

  var actions = {};

  if (element.type === 'label') {
    return actions;
  }


  function removeElement(e) {
    modeling.removeElements([ element ]);
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
