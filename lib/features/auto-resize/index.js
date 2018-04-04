module.exports = {
  __init__: [ 'cmmnAutoResizeProvider' ],
  __depends__: [
    require('diagram-js/lib/features/auto-resize').default
  ],
  cmmnAutoResizeProvider: [ 'type', require('./CmmnAutoResizeProvider') ]
};
