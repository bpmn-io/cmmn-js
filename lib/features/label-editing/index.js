module.exports = {
  __depends__: [
    require('diagram-js/lib/command').default,
    require('diagram-js/lib/features/change-support').default,
    require('diagram-js-direct-editing').default
  ],
  __init__: [ 'labelEditingProvider' ],
  labelEditingProvider: [ 'type', require('./LabelEditingProvider') ]
};
