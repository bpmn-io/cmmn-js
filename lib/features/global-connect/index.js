module.exports = {
  __depends__: [
    require('diagram-js/lib/features/global-connect').default
  ],
  __init__: [ 'cmmnGlobalConnect' ],
  cmmnGlobalConnect: [ 'type', require('./CmmnGlobalConnect') ]
};
