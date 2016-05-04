module.exports = {
  __init__: [
    'labelBehavior',
    'planItemDefinitionUpdater',
    'planningTableUpdater',
    'replaceConnectionBehavior',
    'replaceElementBehavior',
    'resizeCasePlanModelBehavior',
    'sentryUpdater'
  ],
  labelBehavior: [ 'type', require('./LabelBehavior') ],
  planItemDefinitionUpdater: [ 'type', require('./PlanItemDefinitionUpdater') ],
  planningTableUpdater: [ 'type', require('./PlanningTableUpdater') ],
  replaceConnectionBehavior: [ 'type', require('./ReplaceConnectionBehavior') ],
  replaceElementBehavior: [ 'type', require('./ReplaceElementBehavior') ],
  resizeCasePlanModelBehavior: [ 'type', require('./ResizeCasePlanModelBehavior') ],
  sentryUpdater: [ 'type', require('./SentryUpdater') ]
};
