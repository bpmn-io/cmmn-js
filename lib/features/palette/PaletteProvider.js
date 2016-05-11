'use strict';

var assign = require('lodash/object/assign');

/**
 * A palette provider for CMMN 1.1 elements.
 */
function PaletteProvider(palette, create, elementFactory, spaceTool, lassoTool, handTool) {

  this._palette = palette;
  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;
  this._handTool = handTool;

  palette.registerProvider(this);
}

module.exports = PaletteProvider;

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool'
];


PaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      create = this._create,
      elementFactory = this._elementFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool,
      handTool = this._handTool;

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
    'hand-tool': {
      group: 'tools',
      className: 'cmmn-icon-hand-tool',
      title: 'Activate the hand tool',
      action: {
        click: function(event) {
          handTool.activateHand(event);
        }
      }
    },
    'lasso-tool': {
      group: 'tools',
      className: 'cmmn-icon-lasso-tool',
      title: 'Activate the lasso tool',
      action: {
        click: function(event) {
          lassoTool.activateSelection(event);
        }
      }
    },
    'space-tool': {
      group: 'tools',
      className: 'cmmn-icon-space-tool',
      title: 'Activate the create/remove space tool',
      action: {
        click: function(event) {
          spaceTool.activateSelection(event);
        }
      }
    },
    'tool-separator': {
      group: 'tools',
      separator: true
    },
    'create.task': createPlanItem(
      'cmmn:Task', 'planItem', 'cmmn-icon-task'
    ),
    'create.stage': createPlanItem(
      'cmmn:Stage', 'planItem', 'cmmn-icon-stage', 'Create expanded Stage'
    ),
    'create.milestone': createPlanItem(
      'cmmn:Milestone', 'planItem', 'cmmn-icon-milestone'
    ),
    'create.eventListener': createPlanItem(
      'cmmn:EventListener', 'planItem', 'cmmn-icon-event-listener'
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