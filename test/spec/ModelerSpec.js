'use strict';

var Modeler = require('../../lib/Modeler'),
    NavigatedViewer = require('../../lib/NavigatedViewer'),
    Viewer = require('../../lib/Viewer');

var TestContainer = require('mocha-test-container-support');

describe('Modeler', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  function createModeler(xml, done) {
    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err, warnings) {
      done(err, warnings, modeler);
    });
  }


  it('should import simple process', function(done) {
    var xml = require('../fixtures/cmmn/complex.cmmn');
    createModeler(xml, done);
  });


  it('should expose Viewer, NavigatedViewer', function() {
    expect(Modeler.Viewer).to.eql(Viewer);
    expect(Modeler.NavigatedViewer).to.eql(NavigatedViewer);
  });

});
