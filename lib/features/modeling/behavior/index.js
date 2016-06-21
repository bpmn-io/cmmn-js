module.exports = {
  __init__: [
    'attachCriterionBehavior',
    'caseFileItemUpdater',
    'labelBehavior',
    'planItemDefinitionUpdater',
    'planningTableUpdater',
    'replaceConnectionBehavior',
    'replaceElementBehavior',
    'resizeCasePlanModelBehavior',
    'sentryUpdater',
    'unclaimIdBehavior'
  ],
  attachCriterionBehavior: [ 'type', require('./AttachCriterionBehavior') ],
  caseFileItemUpdater: [ 'type', require('./CaseFileItemUpdater') ],
  labelBehavior: [ 'type', require('./LabelBehavior') ],
  planItemDefinitionUpdater: [ 'type', require('./PlanItemDefinitionUpdater') ],
  planningTableUpdater: [ 'type', require('./PlanningTableUpdater') ],
  replaceConnectionBehavior: [ 'type', require('./ReplaceConnectionBehavior') ],
  replaceElementBehavior: [ 'type', require('./ReplaceElementBehavior') ],
  resizeCasePlanModelBehavior: [ 'type', require('./ResizeCasePlanModelBehavior') ],
  sentryUpdater: [ 'type', require('./SentryUpdater') ],
  unclaimIdBehavior: [ 'type', require('./UnclaimIdBehavior') ]
};
