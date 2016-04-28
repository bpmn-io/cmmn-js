'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #SentryUpdater - remove', function() {

  var testModules = [ coreModule, modelingModule ];

  var sentry, host;

  var diagramXML = require('./SentryUpdater.remove.cmmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  describe('delete criterion', function() {

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var criterion = elementRegistry.get('EntryCriterion_1');
      host = criterion.host.businessObject;
      sentry = criterion.businessObject.sentryRef;

      // when
      modeling.removeElements([ criterion ]);
    }));

    it('should execute', function() {
      // when
      expect(host.$parent.sentries).not.to.include(sentry);
      expect(sentry.$parent).not.to.exist;
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(host.$parent.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host.$parent);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(host.$parent.sentries).not.to.include(sentry);
      expect(sentry.$parent).not.to.exist;
    }));

  });


  describe('delete host', function() {

    var parent;

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var hostShape = elementRegistry.get('PI_Task_1');
      host = hostShape.businessObject;
      parent = host.$parent;

      var criterion = elementRegistry.get('EntryCriterion_1');
      sentry = criterion.businessObject.sentryRef;

      // when
      modeling.removeElements([ hostShape ]);
    }));

    it('should execute', function() {
      // when
      expect(parent.sentries).not.to.include(sentry);
      expect(sentry.$parent).not.to.exist;
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(parent.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(parent);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(parent.sentries).not.to.include(sentry);
      expect(sentry.$parent).not.to.exist;
    }));

  });


  describe('delete criterion without referencing any sentry', function() {

    var parent;

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var criterion = elementRegistry.get('EntryCriterion_2');
      host = criterion.host.businessObject;
      parent = host.$parent;

      // when
      modeling.removeElements([ criterion ]);
    }));

    it('should execute', function() {
      // when
      expect(parent.sentries).to.have.length(2);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(parent.sentries).to.have.length(2);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(parent.sentries).to.have.length(2);
    }));

  });


  describe('delete criterion with shared sentry', function() {

    var parent;

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var criterion = elementRegistry.get('EntryCriterion_3');
      host = criterion.host.businessObject;
      parent = host.$parent;
      sentry = criterion.businessObject.sentryRef;

      // when
      modeling.removeElements([ criterion ]);
    }));

    it('should execute', function() {
      // when
      expect(parent.sentries).to.include(sentry);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(parent.sentries).to.include(sentry);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(parent.sentries).to.include(sentry);
    }));

  });

});
