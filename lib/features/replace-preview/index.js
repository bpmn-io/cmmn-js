module.exports = {
  __depends__: [
    require('diagram-js/lib/features/move').default
  ],
  __init__: ['cmmnReplacePreview'],
  cmmnReplacePreview: [ 'type', require('./CmmnReplacePreview') ]
};
