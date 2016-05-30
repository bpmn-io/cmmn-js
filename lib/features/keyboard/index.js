module.exports = {
  __depends__: [
    require('diagram-js/lib/features/keyboard'),
    require('../global-connect')
  ],
  __init__: [ 'cmmnKeyBindings' ],
  cmmnKeyBindings: [ 'type', require('./CmmnKeyBindings') ]
};
