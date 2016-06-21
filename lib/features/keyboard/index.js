module.exports = {
  __depends__: [
    require('diagram-js/lib/features/hand-tool'),
    require('diagram-js/lib/features/keyboard'),
    require('diagram-js/lib/features/lasso-tool'),
    require('diagram-js/lib/features/space-tool'),
    require('diagram-js-direct-editing'),
    require('../global-connect'),
    require('../search')
  ],
  __init__: [ 'cmmnKeyBindings' ],
  cmmnKeyBindings: [ 'type', require('./CmmnKeyBindings') ]
};
