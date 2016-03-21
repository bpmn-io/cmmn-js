'use strict';

var Modeler = require('../../../lib/Modeler');

var TestContainer = require('mocha-test-container-support');

describe('Importer', function() {

  var container,
      modeler;

  beforeEach(function() {
    container = TestContainer.get(this);
    modeler = new Modeler({ container: container });
  });


  it('should set CMMNDiagram as root element', function(done) {

    var xml = require('./Importer.cmmn');

    modeler.importXML(xml, function(err, warnings) {

      var rootElement = modeler.get('canvas').getRootElement();

      expect(rootElement.id).to.equal('Diagram_1');

      done();
    });

  });


  it('should import only first diagram and its elements', function(done) {

    var xml = require('./Importer.cmmn');

    modeler.importXML(xml, function(err, warnings) {

      var elementRegistry = modeler.get('elementRegistry');

      expect(elementRegistry.get('CasePlanModel_1')).to.exist;
      expect(elementRegistry.get('CasePlanModel_2')).not.to.exist;

      done();
    });

  });

});
