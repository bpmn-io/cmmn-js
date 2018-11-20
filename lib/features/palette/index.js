module.exports = {
  __depends__: [
    require('diagram-js/lib/features/palette').default,
    require('diagram-js/lib/features/create').default,
    require('diagram-js/lib/features/space-tool').default,
    require('diagram-js/lib/features/lasso-tool').default,
    require('diagram-js/lib/features/hand-tool').default,
    require('diagram-js/lib/features/global-connect').default
  ],
  __init__: [ 'paletteProvider' ],
  paletteProvider: [ 'type', require('./PaletteProvider') ]
};
