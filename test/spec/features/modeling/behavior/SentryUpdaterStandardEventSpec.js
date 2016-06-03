'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #SentryUpdater - standardEvent', function() {

  var testModules = [ coreModule, modelingModule ];

  var diagramXML = require('./SentryUpdater.standard-event.cmmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  var onPart;

  describe('occur', function() {

    describe('event listener', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var source = elementRegistry.get('PI_EventListener_1');
        var target = elementRegistry.get('EntryCriterion_1');

        // when
        var connection = modeling.connect(source, target, {
          type: 'cmmn:PlanItemOnPart',
          isStandardEventVisible: true
        });

        onPart = connection.businessObject.cmmnElementRef;

      }));

      it('should execute', function() {
        // then
        expect(onPart.standardEvent).to.equal('occur');
      });

      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.standardEvent).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo(),

        // then
        expect(onPart.standardEvent).to.equal('occur');
      }));

    });

    describe('event listener', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var source = elementRegistry.get('PI_Milestone_1');
        var target = elementRegistry.get('EntryCriterion_1');

        // when
        var connection = modeling.connect(source, target, {
          type: 'cmmn:PlanItemOnPart',
          isStandardEventVisible: true
        });

        onPart = connection.businessObject.cmmnElementRef;

      }));

      it('should execute', function() {
        // then
        expect(onPart.standardEvent).to.equal('occur');
      });

      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.standardEvent).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo(),

        // then
        expect(onPart.standardEvent).to.equal('occur');
      }));

    });

  });


  describe('complete', function() {

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('PI_Task_1');
      var target = elementRegistry.get('EntryCriterion_1');

      // when
      var connection = modeling.connect(source, target, {
        type: 'cmmn:PlanItemOnPart',
        isStandardEventVisible: true
      });

      onPart = connection.businessObject.cmmnElementRef;

    }));

    it('should execute', function() {
      // then
      expect(onPart.standardEvent).to.equal('complete');
    });

    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(onPart.standardEvent).not.to.exist;
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo(),

      // then
      expect(onPart.standardEvent).to.equal('complete');
    }));

  });


  describe('exit', function() {

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('ExitCriterion_1');
      var target = elementRegistry.get('EntryCriterion_1');

      // when
      var connection = modeling.connect(source, target, {
        type: 'cmmn:PlanItemOnPart',
        isStandardEventVisible: true
      });

      onPart = connection.businessObject.cmmnElementRef;

    }));

    it('should execute', function() {
      // then
      expect(onPart.standardEvent).to.equal('exit');
    });

    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(onPart.standardEvent).not.to.exist;
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo(),

      // then
      expect(onPart.standardEvent).to.equal('exit');
    }));

  });


  describe('update', function() {

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('CaseFileItem_1');
      var target = elementRegistry.get('EntryCriterion_1');

      // when
      var connection = modeling.connect(source, target, {
        type: 'cmmn:CaseFileItemOnPart',
        isStandardEventVisible: true
      });

      onPart = connection.businessObject.cmmnElementRef;

    }));

    it('should execute', function() {
      // then
      expect(onPart.standardEvent).to.equal('update');
    });

    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(onPart.standardEvent).not.to.exist;
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo(),

      // then
      expect(onPart.standardEvent).to.equal('update');
    }));

  });

});
