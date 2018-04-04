module.exports = {
  __depends__: [
    require('diagram-js/lib/features/hand-tool').default,
    require('diagram-js/lib/features/keyboard').default,
    require('diagram-js/lib/features/lasso-tool').default,
    require('diagram-js/lib/features/space-tool').default,
    require('diagram-js-direct-editing').default,
    require('../global-connect'),
    require('../search')
  ],
  __init__: [ 'cmmnKeyBindings' ],
  cmmnKeyBindings: [ 'type', require('./CmmnKeyBindings') ]
};
