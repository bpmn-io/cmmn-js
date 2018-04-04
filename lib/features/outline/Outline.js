'use strict';

var BaseOutline = require('diagram-js/lib/features/outline/Outline').default;

var inherits = require('inherits');

var isCasePlanModel = require('../../util/ModelUtil').isCasePlanModel;

var svgAttr = require('tiny-svg').attr;


/**
 * This is a subclass of the Outline module from diagram-js.
 * It defines outlines which differ from the element size basis.
 *
 * @param {EventBus} eventBus
 * @param {Styles} styles
 * @param {ElementRegistry} elementRegistry
 */
function Outline(eventBus, styles, elementRegistry) {
  BaseOutline.call(this, eventBus, styles, elementRegistry);
}

inherits(Outline, BaseOutline);

Outline.$inject = [ 'eventBus', 'styles', 'elementRegistry' ];

Outline.prototype.baseUpdateShapeOutline = BaseOutline.prototype.updateShapeOutline;

Outline.prototype.updateShapeOutline = function(outline, element) {

  if (!isCasePlanModel(element)) {

    this.baseUpdateShapeOutline(outline, element);
  } else {

    // update outlines for casePlanModels
    svgAttr(outline, {
      x: -this.offset,
      y: -this.offset - 18,
      width: element.width + this.offset * 2,
      height: element.height + 18 + this.offset * 2
    });
  }
};

module.exports = Outline;
