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


  it('should not create a shape for CMMNDiagram', function(done) {

    var xml = require('./Importer.cmmn');

    modeler.importXML(xml, function(err, warnings) {

      var diagram = modeler.get('elementRegistry').get('Diagram_1');

      expect(diagram).to.exist;
      expect(diagram.businessObject.di).to.be.undefined;

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


  it('should import only first diagram and its cases', function(done) {

    var xml = require('./import-multiple-cases.cmmn');

    modeler.importXML(xml, function(err, warnings) {

      var elementRegistry = modeler.get('elementRegistry');

      expect(elementRegistry.get('CasePlanModel_1')).to.exist;
      expect(elementRegistry.get('CasePlanModel_2')).to.exist;

      expect(elementRegistry.get('CasePlanModel_3')).not.to.exist;

      done();
    });

  });


  it('should not import case plan model without di information', function(done) {

    var xml = require('./import-case-plan-model-without-di.cmmn');

    modeler.importXML(xml, function(err, warnings) {

      var elementRegistry = modeler.get('elementRegistry');

      expect(elementRegistry.get('CasePlanModel_1')).not.to.exist;

      done();
    });

  });


  it('should not create di for CMMNEdge', function(done) {

    var xml = require('./Importer.discretionary-association.cmmn');

    modeler.importXML(xml, function(err, warnings) {

      var assocation = modeler.get('elementRegistry').get('DiscretionaryAssociation_1');

      expect(assocation).to.exist;
      expect(assocation.businessObject.di).to.be.undefined;

      done();
    });

  });

});
