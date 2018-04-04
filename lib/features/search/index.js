module.exports = {
  __depends__: [
    require('diagram-js/lib/features/search-pad').default
  ],
  __init__: [ 'cmmnSearch'],
  cmmnSearch: [ 'type', require('./CmmnSearchProvider') ]
};
