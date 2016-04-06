module.exports = {
  __init__: [
    'resizeCasePlanModelBehavior',
    'planItemDefinitionUpdater'
  ],
  resizeCasePlanModelBehavior: [ 'type', require('./ResizeCasePlanModelBehavior') ],
  planItemDefinitionUpdater: [ 'type', require('./PlanItemDefinitionUpdater') ]
};
