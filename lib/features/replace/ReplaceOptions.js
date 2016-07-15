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
    label: 'Stage (collapsed)',
    actionName: 'replace-with-collapsed-stage-plan-item',
    className: 'cmmn-icon-stage-collapsed',
    target: {
      definitionType: 'cmmn:Stage',
      type: 'cmmn:PlanItem',
      isCollapsed: true
    }
  },
  {
    label: 'Stage (expanded)',
    actionName: 'replace-with-expanded-stage-plan-item',
    className: 'cmmn-icon-stage-expanded',
    target: {
      definitionType: 'cmmn:Stage',
      type: 'cmmn:PlanItem',
      isCollapsed: false
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
  },
  {
    label: 'Discretionary Stage (collapsed)',
    actionName: 'replace-with-collapsed-stage-discretionary-item',
    className: 'cmmn-icon-stage-collapsed-discretionary',
    target: {
      definitionType: 'cmmn:Stage',
      type: 'cmmn:DiscretionaryItem',
      isCollapsed: true
    }
  },
  {
    label: 'Discretionary Stage (expanded)',
    actionName: 'replace-with-expanded-stage-discretionary-item',
    className: 'cmmn-icon-stage-expanded-discretionary',
    target: {
      definitionType: 'cmmn:Stage',
      type: 'cmmn:DiscretionaryItem',
      isCollapsed: false
    }
  }
];


module.exports.PLAN_FRAGMENT_EXPANDED = [
  {
    label: 'Stage',
    actionName: 'replace-with-stage-plan-item',
    className: 'cmmn-icon-stage-expanded',
    target: {
      definitionType: 'cmmn:Stage',
      type: 'cmmn:PlanItem',
      isCollapsed: false
    }
  },
  {
    label: 'Discretionary Stage',
    actionName: 'replace-with-stage-discretionary-item',
    className: 'cmmn-icon-stage-expanded-discretionary',
    target: {
      definitionType: 'cmmn:Stage',
      type: 'cmmn:DiscretionaryItem',
      isCollapsed: false
    }
  },
  {
    label: 'Discretionary Plan Fragment',
    actionName: 'replace-with-plan-fragment-discretionary-item',
    className: 'cmmn-icon-plan-fragment-expanded-discretionary',
    target: {
      definitionType: 'cmmn:PlanFragment',
      type: 'cmmn:DiscretionaryItem',
      isCollapsed: false
    }
  }
];

module.exports.EVENT_LISTENER = [
  {
    label: 'Event Listener',
    actionName: 'replace-with-event-listener-plan-item',
    className: 'cmmn-icon-event-listener',
    target: {
      definitionType: 'cmmn:EventListener',
      type: 'cmmn:PlanItem'
    }
  },
  {
    label: 'Timer Event Listener',
    actionName: 'replace-with-timer-event-listener-plan-item',
    className: 'cmmn-icon-timer-event-listener',
    target: {
      definitionType: 'cmmn:TimerEventListener',
      type: 'cmmn:PlanItem'
    }
  },
  {
    label: 'User Event Listener',
    actionName: 'replace-with-user-event-listener-plan-item',
    className: 'cmmn-icon-user-event-listener',
    target: {
      definitionType: 'cmmn:UserEventListener',
      type: 'cmmn:PlanItem'
    }
  }
];


module.exports.CRITERION = [
  {
    label: 'Entry Criterion',
    actionName: 'replace-with-entry-criterion',
    className: 'cmmn-icon-entry-criterion',
    target: {
      type: 'cmmn:EntryCriterion'
    }
  },
  {
    label: 'Exit Criterion',
    actionName: 'replace-with-exit-criterion',
    className: 'cmmn-icon-exit-criterion',
    target: {
      type: 'cmmn:ExitCriterion'
    }
  }
];