module.exports = {
  __depends__: [
    require('diagram-js/lib/features/context-pad'),
    require('diagram-js/lib/features/selection'),
    require('../popup-menu')
  ],
  __init__: [ 'contextPadProvider' ],
  contextPadProvider: [ 'type', require('./ContextPadProvider') ]
};