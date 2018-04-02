'use strict';

var bundle = require('./bundle');

var path = require('path');

var mkdirp = require('mkdirp').sync,
    cp = require('cpx').copySync,
    del = require('del').sync;

var dest = process.env.DISTRO_DIST || 'dist';


function resolve(module, sub) {
  var pkg = require.resolve(module + '/package.json');

  return path.dirname(pkg) + sub;
}

console.log('clean ' + dest);
del(dest);

console.log('mkdir -p ' + dest);
mkdirp(dest);

console.log('copy cmmn-font to ' + dest + '/cmmn-font');
cp(resolve('cmmn-font', '/dist/{font,css}/**'), dest + '/assets/cmmn-font');

console.log('copy diagram-js.css to ' + dest);
cp(resolve('diagram-js', '/assets/**'), dest + '/assets');

bundle(dest, {
  'cmmn-viewer': 'lib/Viewer.js',
  'cmmn-navigated-viewer': 'lib/NavigatedViewer.js',
  'cmmn-modeler': 'lib/Modeler.js'
}, function(err) {

  if (err) {
    console.error('bundling failed', err);

    process.exit(1);
  }
});