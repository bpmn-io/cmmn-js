'use strict';

var assign = require('min-dash').assign;

/**
 * A palette provider for CMMN 1.1 elements.
 */
function PaletteProvider(
    create,
    elementFactory,
    globalConnect,
    handTool,
    lassoTool,
    palette,
    spaceTool
) {

  this._create = create;
  this._elementFactory = elementFactory;
  this._globalConnect = globalConnect;
  this._handTool = handTool;
  this._palette = palette;
  this._lassoTool = lassoTool;
  this._spaceTool = spaceTool;

  palette.registerProvider(this);
}

module.exports = PaletteProvider;

PaletteProvider.$inject = [
  'create',
  'elementFactory',
  'globalConnect',
  'handTool',
  'lassoTool',
  'palette',
  'spaceTool'
];


PaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions = {},
      create = this._create,
      elementFactory = this._elementFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool,
      globalConnect = this._globalConnect,
      handTool = this._handTool;

  function createPlanItem(type, group, className, title) {

    function createListener(event) {
      create.start(event, elementFactory.createPlanItemShape(type));
    }

    var shortType = type.replace(/^cmmn:/, '');

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

  function createCriterion(event) {
    create.start(event, elementFactory.createCriterionShape('cmmn:EntryCriterion'));
  }

  function createCaseFileItem(event) {
    create.start(event, elementFactory.createCaseFileItemShape());
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
    'global-connect-tool': {
      group: 'tools',
      className: 'cmmn-icon-connection',
      title: 'Activate the global connect tool',
      action: {
        click: function(event) {
          globalConnect.toggle(event);
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
      'cmmn:Stage', 'planItem', 'cmmn-icon-stage-expanded', 'Create expanded Stage'
    ),
    'create.milestone': createPlanItem(
      'cmmn:Milestone', 'planItem', 'cmmn-icon-milestone'
    ),
    'create.eventListener': createPlanItem(
      'cmmn:EventListener', 'planItem', 'cmmn-icon-event-listener'
    ),
    'create.criterion': {
      group: 'criterion',
      className: 'cmmn-icon-entry-criterion',
      title: 'Create Criterion',
      action: {
        dragstart: createCriterion,
        click: createCriterion
      }
    },
    'create.casePlanModel': {
      group: 'casePlanModel',
      className: 'cmmn-icon-case-plan-model',
      title: 'Create CasePlanModel',
      action: {
        dragstart: createCasePlanModel,
        click: createCasePlanModel
      }
    },
    'create.caseFileItem': {
      group: 'caseFileItem',
      className: 'cmmn-icon-case-file-item',
      title: 'Create Case File Item',
      action: {
        dragstart: createCaseFileItem,
        click: createCaseFileItem
      }
    }

  });

  return actions;
};