module.exports = {
  __init__: [
    'planItemDefinitionUpdater',
    'planningTableUpdater',
    'replaceConnectionBehavior',
    'resizeCasePlanModelBehavior',
  ],
  planItemDefinitionUpdater: [ 'type', require('./PlanItemDefinitionUpdater') ],
  planningTableUpdater: [ 'type', require('./PlanningTableUpdater') ],
  replaceConnectionBehavior: [ 'type', require('./ReplaceConnectionBehavior') ],
  resizeCasePlanModelBehavior: [ 'type', require('./ResizeCasePlanModelBehavior') ]
};
