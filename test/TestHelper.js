'use strict';

var TestHelper = module.exports = require('./helper');

TestHelper.insertCSS('diagram-js.css', require('diagram-js/assets/diagram-js.css'));

TestHelper.insertCSS('cmmn-embedded.css', require('../assets/cmmn-font/css/cmmn-embedded.css'));

TestHelper.insertCSS('diagram-js-testing.css',
  '.test-container .result { height: 500px; }' + '.test-container > div'
);

global.chai.use(require('diagram-js/test/matchers/BoundsMatchers'));
global.chai.use(require('diagram-js/test/matchers/ConnectionMatchers'));
