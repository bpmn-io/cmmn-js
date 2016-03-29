'use strict';

var assign = require('lodash/object/assign');

/**
 * A palette provider for CMMN 1.1 elements.
 */
function PaletteProvider(palette, create, elementFactory) {

  this._palette = palette;
  this._create = create;
  this._elementFactory = elementFactory;

  palette.registerProvider(this);
}

module.exports = PaletteProvider;

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory'
];


PaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      create = this._create,
      elementFactory = this._elementFactory;

  function createPlanItem(type, group, className, title) {

    function createListener(event) {
      create.start(event, elementFactory.createPlanItemShape(type));
    }

    var shortType = type.replace(/^cmmn\:/, '');

    return {
      group: group,
      className: className,
      title: title || 'Create ' + shortType,
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  function createCasePlanModel(event) {
    create.start(event, elementFactory.createCasePlanModelShape());
  }

  assign(actions, {

    'create.task': createPlanItem(
      'cmmn:Task', 'planItem', 'cmmn-icon-task'
    ),
    'create.stage': createPlanItem(
      'cmmn:Stage', 'planItem', 'cmmn-icon-stage', 'Create expanded Stage'
    ),
    'create.casePlanModel': {
      group: 'casePlanModel',
      className: 'cmmn-icon-case-plan-model',
      title: 'Create CasePlanModel',
      action: {
        dragstart: createCasePlanModel,
        click: createCasePlanModel
      }
    }

  });

  return actions;
};