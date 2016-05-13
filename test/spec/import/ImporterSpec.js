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

    var xml = require('./Importer.multiple-cases.cmmn');

    modeler.importXML(xml, function(err, warnings) {

      var elementRegistry = modeler.get('elementRegistry');

      expect(elementRegistry.get('CasePlanModel_1')).to.exist;
      expect(elementRegistry.get('CasePlanModel_2')).to.exist;

      expect(elementRegistry.get('CasePlanModel_3')).not.to.exist;

      done();
    });

  });


  it('should not import case plan model without di information', function(done) {

    var xml = require('./Importer.case-plan-model-without-di.cmmn');

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


  it('should import cases one with connections another without connections', function(done) {

    var xml = require('./Importer.connections.cmmn');

    modeler.importXML(xml, function(err, warnings) {

      expect(warnings.length).to.equal(0);

      done(err);
    });

  });


  it('should import discretionary item referenced by multiple plan items', function(done) {

    var xml = require('./Importer.multiple-discretionary-connection.cmmn');

    modeler.importXML(xml, function(err, warnings) {

      var discretionaryItem = modeler.get('elementRegistry').get('DIS_Task_1');

      expect(discretionaryItem).to.exist;

      done(err);
    });

  });

  it('should import text annotations', function(done) {

    var xml = require('./Importer.text-annotation.cmmn');

    modeler.importXML(xml, function(err, warnings) {

      var elementRegistry = modeler.get('elementRegistry');
      var rootElement = modeler.get('canvas').getRootElement();

      var textAnnotation1 = elementRegistry.get('TextAnnotation_1');
      var textAnnotation2 = elementRegistry.get('TextAnnotation_2');
      var textAnnotation3 = elementRegistry.get('TextAnnotation_3');
      var textAnnotation4 = elementRegistry.get('TextAnnotation_4');
      var textAnnotation5 = elementRegistry.get('TextAnnotation_5');
      var textAnnotation6 = elementRegistry.get('TextAnnotation_6');

      expect(textAnnotation1).to.exist;
      expect(textAnnotation1.parent).to.equal(elementRegistry.get('PI_Stage_4'));

      expect(textAnnotation2).to.exist;
      expect(textAnnotation2.parent).to.equal(elementRegistry.get('PI_Stage_1'));

      expect(textAnnotation3).to.exist;
      expect(textAnnotation3.parent).to.equal(elementRegistry.get('PI_Stage_2'));

      expect(textAnnotation4).to.exist;
      expect(textAnnotation4.parent).to.equal(elementRegistry.get('PI_Stage_3'));

      expect(textAnnotation5).to.exist;
      expect(textAnnotation5.parent).to.equal(rootElement);

      expect(textAnnotation6).to.exist;
      expect(textAnnotation6.parent).to.equal(elementRegistry.get('CasePlanModel_1'));

      done(err);
    });

  });


  it('should import associations', function(done) {

    var xml = require('./Importer.association.cmmn');

    modeler.importXML(xml, function(err, warnings) {

      var elementRegistry = modeler.get('elementRegistry');

      expect(elementRegistry.get('Association_1_di')).to.exist;
      expect(elementRegistry.get('Association_2_di')).to.exist;
      expect(elementRegistry.get('Association_3_di')).to.exist;

      done(err);
    });

  });


  it('should import case file items', function(done) {

    var xml = require('./Importer.case-file-item.cmmn');

    modeler.importXML(xml, function(err, warnings) {

      var elementRegistry = modeler.get('elementRegistry');
      var rootElement = modeler.get('canvas').getRootElement();

      var caseFileItem1 = elementRegistry.get('CaseFileItem_1');
      var caseFileItem2 = elementRegistry.get('CaseFileItem_2');
      var caseFileItem3 = elementRegistry.get('CaseFileItem_3');
      var caseFileItem4 = elementRegistry.get('CaseFileItem_4');
      var caseFileItem5 = elementRegistry.get('CaseFileItem_5');
      var caseFileItem6 = elementRegistry.get('CaseFileItem_6');

      expect(caseFileItem1).to.exist;
      expect(caseFileItem1.parent).to.equal(elementRegistry.get('PI_Stage_1'));

      expect(caseFileItem2).to.exist;
      expect(caseFileItem2.parent).to.equal(elementRegistry.get('PI_Stage_4'));

      expect(caseFileItem3).to.exist;
      expect(caseFileItem3.parent).to.equal(elementRegistry.get('PI_Stage_3'));

      expect(caseFileItem4).to.exist;
      expect(caseFileItem4.parent).to.equal(elementRegistry.get('PI_Stage_2'));

      expect(caseFileItem5).to.exist;
      expect(caseFileItem5.parent).to.equal(rootElement);

      expect(caseFileItem6).to.exist;
      expect(caseFileItem6.parent).to.equal(elementRegistry.get('CasePlanModel_1'));

      done(err);
    });

  });

});
