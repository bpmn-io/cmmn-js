module.exports = {
  __depends__: [
    require('diagram-js/lib/features/context-pad'),
    require('diagram-js/lib/features/selection'),
  ],
  __init__: [ 'contextPadProvider' ],
  contextPadProvider: [ 'type', require('./ContextPadProvider') ]
};