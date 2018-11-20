module.exports = {
  __depends__: [
    require('diagram-js/lib/features/keyboard').default
  ],
  __init__: [ 'keyboardBindings' ],
  keyboardBindings: [ 'type', require('./CmmnKeyboardBindings') ]
};
