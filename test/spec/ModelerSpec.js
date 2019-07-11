'use strict';

var Modeler = require('../../lib/Modeler');

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


  it('should import complex', function(done) {
    var xml = require('../fixtures/cmmn/complex.cmmn');
    createModeler(xml, done);
  });


  it('should import simple', function(done) {
    var xml = require('../fixtures/cmmn/simple.cmmn');
    createModeler(xml, done);
  });


  it('should import containers', function(done) {
    var xml = require('../fixtures/cmmn/containers.cmmn');
    createModeler(xml, done);
  });


  it('should re-import simple diagram', function(done) {

    var xml = require('../fixtures/cmmn/simple.cmmn');

    // given
    createModeler(xml, function(err, warnings, modeler) {

      if (err) {
        return done(err);
      }

      // when
      // mimic re-import of same diagram
      modeler.importXML(xml, function(err, warnings) {

        if (err) {
          return done(err);
        }

        // then
        expect(warnings.length).to.equal(0);

        done();
      });

    });
  });


  describe('defaults', function() {

    it('should not attach per default', function(done) {

      var xml = require('../fixtures/cmmn/simple.cmmn');

      var modeler = new Modeler();

      modeler.importXML(xml, function(err, warnings) {

        expect(modeler._container.parentNode).not.to.exist;

        done(err, warnings);
      });
    });

  });


  describe('configuration', function() {

    // given
    var xml = require('../fixtures/cmmn/simple.cmmn');

    it('should configure Canvas', function(done) {

      // given
      var modeler = new Modeler({
        container: container,
        canvas: {
          deferUpdate: true
        }
      });

      // when
      modeler.importXML(xml, function(err) {

        var canvasConfig = modeler.get('config.canvas');

        // then
        expect(canvasConfig.deferUpdate).to.be.true;

        done();
      });

    });

  });


  describe('ids', function() {

    it('should provide ids with moddle', function() {

      // given
      var modeler = new Modeler({ container: container });

      // when
      var moddle = modeler.get('moddle');

      // then
      expect(moddle.ids).to.exist;
    });


    it('should populate ids on import', function(done) {

      // given
      var xml = require('../fixtures/cmmn/simple.cmmn');

      var modeler = new Modeler({ container: container });

      var moddle = modeler.get('moddle');
      var elementRegistry = modeler.get('elementRegistry');

      // when
      modeler.importXML(xml, function(err) {

        var task = elementRegistry.get('PI_Task_1').businessObject;
        var casePlanModelDi = elementRegistry.get('CasePlanModel_1').businessObject.di;

        // then
        expect(moddle.ids.assigned('PI_Task_1')).to.eql(task);
        expect(moddle.ids.assigned('DI_CasePlanModel_1')).to.eql(casePlanModelDi);

        done();
      });

    });


    it('should clear ids before re-import', function(done) {

      // given
      var someXML = require('../fixtures/cmmn/simple.cmmn'),
          otherXML = require('../fixtures/cmmn/empty-definitions.cmmn');

      var modeler = new Modeler({ container: container });

      var moddle = modeler.get('moddle');

      // when
      modeler.importXML(someXML, function() {

        modeler.importXML(otherXML, function() {

          // then
          // not in empty-definitions.cmmn
          expect(moddle.ids.assigned('PI_Task_1')).to.be.false;

          // in other.cmmn
          // TODO(nre): add

          done();
        });
      });

    });

  });


  it('should handle errors', function(done) {

    var xml = 'invalid stuff';

    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err) {

      expect(err).to.exist;

      done();
    });
  });


  it('should create new diagram', function(done) {
    var modeler = new Modeler({ container: container });
    modeler.createDiagram(done);
  });


  describe('editor actions support', function() {

    it('should ship all actions', function() {

      // given
      var expectedActions = [
        'undo',
        'redo',
        'stepZoom',
        'zoom',
        'removeSelection',
        'moveCanvas',
        'moveSelection',
        'selectElements',
        'spaceTool',
        'lassoTool',
        'handTool',
        'globalConnectTool',
        'directEditing',
        'find'
      ];

      var modeler = new Modeler();

      // when
      var editorActions = modeler.get('editorActions');

      // then
      var actualActions = editorActions.getActions();

      expect(actualActions).to.eql(expectedActions);
    });

  });


  describe('dependency injection', function() {

    it('should provide self as <cmmnjs>', function(done) {

      var xml = require('../fixtures/cmmn/simple.cmmn');

      createModeler(xml, function(err, warnings, modeler) {

        expect(modeler.get('cmmnjs')).to.equal(modeler);

        done(err);
      });
    });


    it('should allow Diagram#get before import', function() {

      // when
      var modeler = new Modeler({ container: container });

      // then
      var eventBus = modeler.get('eventBus');

      expect(eventBus).to.exist;
    });


    it('should keep references to services across re-import', function(done) {

      // given
      var someXML = require('../fixtures/cmmn/simple.cmmn'),
          otherXML = require('../fixtures/cmmn/empty-definitions.cmmn');

      var modeler = new Modeler({ container: container });

      var eventBus = modeler.get('eventBus'),
          canvas = modeler.get('canvas');

      // when
      modeler.importXML(someXML, function() {

        // then
        expect(modeler.get('canvas')).to.equal(canvas);
        expect(modeler.get('eventBus')).to.equal(eventBus);

        modeler.importXML(otherXML, function() {

          // then
          expect(modeler.get('canvas')).to.equal(canvas);
          expect(modeler.get('eventBus')).to.equal(eventBus);

          done();
        });
      });

    });

  });


  it('should expose Viewer and NavigatedViewer', function() {

    // given
    var Viewer = require('../../lib/Viewer');
    var NavigatedViewer = require('../../lib/NavigatedViewer');

    // then
    expect(Modeler.Viewer).to.equal(Viewer);
    expect(Modeler.NavigatedViewer).to.equal(NavigatedViewer);
  });

});
