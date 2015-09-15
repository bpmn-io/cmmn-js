'use strict';

var TestHelper = module.exports = require('./helper');

TestHelper.insertCSS('diagram-js.css', require('diagram-js/assets/diagram-js.css'));

TestHelper.insertCSS('diagram-js-testing.css',
  '.test-container .result { height: 500px; }' + '.test-container > div'
);
