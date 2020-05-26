'use strict';

var TestHelper = module.exports = require('./helper');

TestHelper.insertCSS('diagram-js.css',
  require('diagram-js/assets/diagram-js.css')
);

TestHelper.insertCSS('cmmn-embedded.css',
  require('cmmn-font/dist/css/cmmn-embedded.css')
);

TestHelper.insertCSS('diagram-js-testing.css',
  'body .test-container { height: auto }' +
  'body .test-container .test-content-container { height: 90vmin; }'
);

global.chai.use(require('diagram-js/test/matchers/BoundsMatchers').default);
global.chai.use(require('diagram-js/test/matchers/ConnectionMatchers').default);
