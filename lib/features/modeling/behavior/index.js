module.exports = {
  __init__: [
    'resizeCasePlanModelBehavior',
    'planItemDefinitionUpdater',
    'planningTableUpdater'
  ],
  resizeCasePlanModelBehavior: [ 'type', require('./ResizeCasePlanModelBehavior') ],
  planItemDefinitionUpdater: [ 'type', require('./PlanItemDefinitionUpdater') ],
  planningTableUpdater: [ 'type', require('./PlanningTableUpdater') ]
};
