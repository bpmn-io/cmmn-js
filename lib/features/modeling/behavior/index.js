module.exports = {
  __init__: [
    'caseFileItemUpdater',
    'labelBehavior',
    'planItemDefinitionUpdater',
    'planningTableUpdater',
    'replaceConnectionBehavior',
    'replaceElementBehavior',
    'resizeCasePlanModelBehavior',
    'sentryUpdater'
  ],
  caseFileItemUpdater: [ 'type', require('./CaseFileItemUpdater') ],
  labelBehavior: [ 'type', require('./LabelBehavior') ],
  planItemDefinitionUpdater: [ 'type', require('./PlanItemDefinitionUpdater') ],
  planningTableUpdater: [ 'type', require('./PlanningTableUpdater') ],
  replaceConnectionBehavior: [ 'type', require('./ReplaceConnectionBehavior') ],
  replaceElementBehavior: [ 'type', require('./ReplaceElementBehavior') ],
  resizeCasePlanModelBehavior: [ 'type', require('./ResizeCasePlanModelBehavior') ],
  sentryUpdater: [ 'type', require('./SentryUpdater') ]
};
