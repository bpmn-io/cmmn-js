module.exports = {
  __depends__: [
    require('diagram-js/lib/features/popup-menu').default,
    require('diagram-js/lib/features/replace').default,
    require('diagram-js/lib/features/selection').default
  ],
  cmmnReplace: [ 'type', require('./CmmnReplace') ]
};