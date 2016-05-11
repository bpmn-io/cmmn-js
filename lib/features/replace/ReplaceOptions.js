'use strict';


module.exports.TASK = [
  {
    label: 'Task',
    actionName: 'replace-with-task-plan-item',
    className: 'cmmn-icon-task-none',
    target: {
      definitionType: 'cmmn:Task',
      type: 'cmmn:PlanItem'
    }
  },
  {
    label: 'Human Task',
    actionName: 'replace-with-blocking-human-task-plan-item',
    className: 'cmmn-icon-human-blocking-task',
    target: {
      definitionType: 'cmmn:HumanTask',
      type: 'cmmn:PlanItem',
      isBlocking: true
    }
  },
  {
    label: 'Human Task',
    actionName: 'replace-with-non-blocking-human-task-plan-item',
    className: 'cmmn-icon-human-non-blocking-task',
    target: {
      definitionType: 'cmmn:HumanTask',
      type: 'cmmn:PlanItem',
      isBlocking: false
    }
  },
  {
    label: 'Decision Task',
    actionName: 'replace-with-decision-task-plan-item',
    className: 'cmmn-icon-decision-task',
    target: {
      definitionType: 'cmmn:DecisionTask',
      type: 'cmmn:PlanItem'
    }
  },
  {
    label: 'Process Task',
    actionName: 'replace-with-process-task-plan-item',
    className: 'cmmn-icon-process-task',
    target: {
      definitionType: 'cmmn:ProcessTask',
      type: 'cmmn:PlanItem'
    }
  },
  {
    label: 'Case Task',
    actionName: 'replace-with-case-task-plan-item',
    className: 'cmmn-icon-case-task',
    target: {
      definitionType: 'cmmn:CaseTask',
      type: 'cmmn:PlanItem'
    }
  },
  {
    label: 'Discretionary Task',
    actionName: 'replace-with-task-discretionary-item',
    className: 'cmmn-icon-task-discretionary',
    target: {
      definitionType: 'cmmn:Task',
      type: 'cmmn:DiscretionaryItem'
    }
  },
  {
    label: 'Discretionary Human Task',
    actionName: 'replace-with-blocking-human-task-discretionary-item',
    className: 'cmmn-icon-human-blocking-task-discretionary',
    target: {
      definitionType: 'cmmn:HumanTask',
      type: 'cmmn:DiscretionaryItem',
      isBlocking: true
    }
  },
  {
    label: 'Discretionary Human Task',
    actionName: 'replace-with-non-blocking-human-task-discretionary-item',
    className: 'cmmn-icon-human-non-blocking-task-discretionary',
    target: {
      definitionType: 'cmmn:HumanTask',
      type: 'cmmn:DiscretionaryItem',
      isBlocking: false
    }
  },
  {
    label: 'Discretionary Decision Task',
    actionName: 'replace-with-decision-task-discretionary-item',
    className: 'cmmn-icon-decision-task-discretionary',
    target: {
      definitionType: 'cmmn:DecisionTask',
      type: 'cmmn:DiscretionaryItem'
    }
  },
  {
    label: 'Discretionary Process Task',
    actionName: 'replace-with-process-task-discretionary-item',
    className: 'cmmn-icon-process-task-discretionary',
    target: {
      definitionType: 'cmmn:ProcessTask',
      type: 'cmmn:DiscretionaryItem'
    }
  },
  {
    label: 'Discretionary Case Task',
    actionName: 'replace-with-case-task-discretionary-item',
    className: 'cmmn-icon-case-task-discretionary',
    target: {
      definitionType: 'cmmn:CaseTask',
      type: 'cmmn:DiscretionaryItem'
    }
  }
];
