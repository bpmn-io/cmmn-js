var isString = require('min-dash').isString;
var assign = require('min-dash').assign;

/**
 * Create a fake key event for testing purposes.
 *
 * @param {String|Number} key the key or keyCode/charCode
 * @param {Object} [attrs]
 *
 * @return {Event}
 */
function createKeyEvent(key, attrs) {
  var event = document.createEvent('Events') || new document.defaultView.CustomEvent('keyEvent');

  // init and mark as bubbles / cancelable
  event.initEvent('keydown', false, true);

  var keyAttrs = isString(key) ? { key: key } : { keyCode: key, which: key };

  return assign(event, keyAttrs, attrs || {});
}

module.exports.createKeyEvent = createKeyEvent;