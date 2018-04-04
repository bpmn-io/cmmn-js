module.exports = {
  __depends__: [
    require('diagram-js/lib/features/connect').default,
    require('diagram-js/lib/features/context-pad').default,
    require('diagram-js/lib/features/create').default,
    require('diagram-js/lib/features/selection').default,
    require('../popup-menu')
  ],
  __init__: [ 'contextPadProvider' ],
  contextPadProvider: [ 'type', require('./ContextPadProvider') ]
};