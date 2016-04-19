'use strict';

var LabelUtil = require('../LabelUtil');

/**
 * A handler that updates the text of a CMMN element.
 */
function UpdateLabelHandler(elementRegistry) {

  /**
   * Set the label and return the changed elements.
   *
   * Element parameter can be label itself or connection (i.e. sequence flow).
   *
   * @param {djs.model.Base} element
   * @param {String} text
   */
  function setText(element, text) {

    // external label if present
    var label = element.label || element;

    var labelTarget = element.labelTarget || element;

    LabelUtil.setLabel(label, text, labelTarget !== label, isExclusiveRef());

    return [ label, labelTarget ];
  }

  /**
   * Return a function which checks if the element is the only reference to a definition
   *
   * @param  {djs.model.Base} element
   *
   * @return {Function}
   */
  function isExclusiveRef() {

    return function(element) {
      var definition = element.businessObject.definitionRef;

      var references = elementRegistry.filter(function(el) {
        return el.businessObject.definitionRef === definition && el.type !== 'label';
      });

      return references.length === 1;
    };
  }


  function execute(ctx) {
    ctx.oldLabel = LabelUtil.getLabel(ctx.element);
    return setText(ctx.element, ctx.newLabel);
  }

  function revert(ctx) {
    return setText(ctx.element, ctx.oldLabel);
  }

  // API

  this.execute = execute;
  this.revert = revert;
}


UpdateLabelHandler.$inject = [ 'elementRegistry' ];

module.exports = UpdateLabelHandler;
