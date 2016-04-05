module.exports = {
  __depends__: [
    require('diagram-js/lib/features/keyboard')
  ],
  __init__: [ 'cmmnKeyBindings' ],
  cmmnKeyBindings: [ 'type', require('./CmmnKeyBindings') ]
};
