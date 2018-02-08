'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #SentryUpdater - discretionary connection', function() {

  var testModules = [ coreModule, modelingModule ];

  var sentry, source, target;

  var diagramXML = require('./SentryUpdater.discretionary-connection.cmmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  describe('delete', function() {

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var connection = elementRegistry.get('DiscretionaryConnection_1');

      source = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;
      target = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

      sentry = elementRegistry.get('EntryCriterion_1').businessObject.sentryRef;

      // when
      modeling.removeConnection(connection);
    }));


    it('should execute', function() {
      // then
      expect(source.sentries).not.to.include(sentry);
      expect(target.sentries).to.include(sentry);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(source.sentries).to.include(sentry);
      expect(target.sentries).not.to.include(sentry);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(source.sentries).not.to.include(sentry);
      expect(target.sentries).to.include(sentry);
    }));

  });


  describe('create', function() {

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var sourceShape = elementRegistry.get('PI_HumanTask_2');
      var targetShape = elementRegistry.get('DIS_Task_2');

      sentry = elementRegistry.get('EntryCriterion_2').businessObject.sentryRef;
      source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;
      target = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

      // when
      modeling.connect(sourceShape, targetShape, { type: 'cmmndi:CMMNEdge' });
    }));


    it('should execute', function() {
      // then
      expect(source.sentries).not.to.include(sentry);
      expect(target.sentries).to.include(sentry);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(source.sentries).to.include(sentry);
      expect(target.sentries).not.to.include(sentry);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(source.sentries).not.to.include(sentry);
      expect(target.sentries).to.include(sentry);
    }));

  });


  describe('reconnectStart', function() {

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var connection = elementRegistry.get('DiscretionaryConnection_1');
      var sourceShape = elementRegistry.get('PI_HumanTask_3');

      sentry = elementRegistry.get('EntryCriterion_1').businessObject.sentryRef;
      source = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;
      target = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

      var newWaypoints = [{
        x: sourceShape.x + 100,
        y: sourceShape.y + 40
      }, connection.waypoints[1]];

      // when
      modeling.reconnectStart(connection, sourceShape, newWaypoints);
    }));


    it('should execute', function() {
      // then
      expect(source.sentries).not.to.include(sentry);
      expect(target.sentries).to.include(sentry);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(source.sentries).to.include(sentry);
      expect(target.sentries).not.to.include(sentry);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(source.sentries).not.to.include(sentry);
      expect(target.sentries).to.include(sentry);
    }));

  });


  describe('reconnectEnd', function() {

    var oldEndSentry, oldEndSource, oldEndTarget;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var connection = elementRegistry.get('DiscretionaryConnection_1');
      var targetShape = elementRegistry.get('DIS_Task_5');

      sentry = elementRegistry.get('EntryCriterion_5').businessObject.sentryRef;
      source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;
      target = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

      oldEndSentry = elementRegistry.get('EntryCriterion_1').businessObject.sentryRef;
      oldEndSource = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;
      oldEndTarget = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

      var newWaypoints = [
        connection.waypoints[0],
        {
          x: targetShape.x,
          y: targetShape.y + 40
        }
      ];

      // when
      modeling.reconnectEnd(connection, targetShape, newWaypoints);
    }));


    it('should execute', function() {
      // then
      expect(source.sentries).not.to.include(sentry);
      expect(target.sentries).to.include(sentry);


      expect(oldEndSource.sentries).not.to.include(oldEndSentry);
      expect(oldEndTarget.sentries).to.include(oldEndSentry);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(source.sentries).to.include(sentry);
      expect(target.sentries).not.to.include(sentry);

      expect(oldEndSource.sentries).to.include(oldEndSentry);
      expect(oldEndTarget.sentries).not.to.include(oldEndSentry);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(source.sentries).not.to.include(sentry);
      expect(target.sentries).to.include(sentry);

      expect(oldEndSource.sentries).not.to.include(oldEndSentry);
      expect(oldEndTarget.sentries).to.include(oldEndSentry);
    }));

  });


  describe('duplicate sentry', function() {

    var newSentry, newSource, newTarget;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var sourceShape = elementRegistry.get('PI_HumanTask_2');
      var targetShape = elementRegistry.get('DIS_Task_3');

      sentry = elementRegistry.get('EntryCriterion_3').businessObject.sentryRef;
      source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;
      target = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

      // when
      modeling.connect(sourceShape, targetShape, { type: 'cmmndi:CMMNEdge' });

      newSentry = elementRegistry.get('EntryCriterion_3').businessObject.sentryRef;
      newSource = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;
      newTarget = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

    }));


    it('should execute', function() {
      // then
      expect(source.sentries).to.include(sentry);
      expect(target.sentries).to.include(sentry);

      expect(newSource.sentries).not.to.include(newSentry);
      expect(newTarget.sentries).to.include(newSentry);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(source.sentries).to.include(sentry);
      expect(target.sentries).to.include(sentry);

      expect(newSource.sentries).not.to.include(newSentry);
      expect(newTarget.sentries).not.to.include(newSentry);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(source.sentries).to.include(sentry);
      expect(target.sentries).to.include(sentry);

      expect(newSource.sentries).not.to.include(newSentry);
      expect(newTarget.sentries).to.include(newSentry);
    }));

  });

});
