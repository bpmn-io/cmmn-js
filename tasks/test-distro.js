var execSync = require('execa').sync;

var failures = 0;

function runTest(variant, env) {

  var NODE_ENV = process.env.NODE_ENV;

  process.env.VARIANT = variant;
  process.env.NODE_ENV = env;

  console.log('[TEST] ' + variant + '@' + env);

  try {
    execSync('karma', [ 'start', 'test/config/karma.distro.js' ]);
  } catch (e) {
    console.error('[TEST] FAILURE');
    console.error(e);

    failures++;
  } finally {
    process.env.NODE_ENV = NODE_ENV;
  }
}

function test() {

  runTest('cmmn-modeler', 'development');
  runTest('cmmn-modeler', 'production');

  runTest('cmmn-navigated-viewer', 'development');
  runTest('cmmn-navigated-viewer', 'production');

  runTest('cmmn-viewer', 'development');
  runTest('cmmn-viewer', 'production');

  if (failures) {
    process.exit(1);
  }
}


test();