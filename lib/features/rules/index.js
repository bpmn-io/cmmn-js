module.exports = {
  __depends__: [
    require('diagram-js/lib/features/rules').default
  ],
  __init__: [ 'cmmnRules' ],
  cmmnRules: [ 'type', require('./CmmnRules') ]
};