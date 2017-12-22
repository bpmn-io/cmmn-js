'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');

var ATTACH = {
  attach: true
};


describe('features/modeling - #SentryUpdater - add', function() {

  var testModules = [ coreModule, modelingModule ];

  var criterionShape, sentry, host;

  describe('attach to case plan model', function() {

    var diagramXML = require('./SentryUpdater.add.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementFactory) {
      criterionShape = elementFactory.createCriterionShape('cmmn:ExitCriterion');
      var criterion = criterionShape.businessObject;
      sentry = criterion.sentryRef;
    }));

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var hostShape = elementRegistry.get('CasePlanModel_1');
      host = hostShape.businessObject;

      // when
      modeling.createShape(criterionShape, { x: 117, y: 170 }, hostShape, ATTACH);
    }));

    it('should execute', function() {
      // when
      expect(host.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(host.sentries).not.to.include(sentry);
      expect(sentry.$parent).not.to.exist;
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(host.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host);
    }));

  });


  describe('attach to stage', function() {

    var diagramXML = require('./SentryUpdater.add.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementFactory) {
      criterionShape = elementFactory.createCriterionShape('cmmn:ExitCriterion');
      var criterion = criterionShape.businessObject;
      sentry = criterion.sentryRef;
    }));

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var hostShape = elementRegistry.get('PI_Stage_1');
      host = hostShape.businessObject;

      // when
      modeling.createShape(criterionShape, { x: 146, y: 170 }, hostShape, ATTACH);
    }));

    it('should execute', function() {
      // when
      expect(host.$parent.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host.$parent);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(host.$parent.sentries).not.to.include(sentry);
      expect(sentry.$parent).not.to.exist;
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(host.$parent.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host.$parent);
    }));

  });


  describe('attach to task', function() {

    var diagramXML = require('./SentryUpdater.add.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementFactory) {
      criterionShape = elementFactory.createCriterionShape('cmmn:ExitCriterion');
      var criterion = criterionShape.businessObject;
      sentry = criterion.sentryRef;
    }));

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var hostShape = elementRegistry.get('PI_Task_1');
      host = hostShape.businessObject;

      // when
      modeling.createShape(criterionShape, { x: 196, y: 170 }, hostShape, ATTACH);
    }));

    it('should execute', function() {
      // when
      expect(host.$parent.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host.$parent);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(host.$parent.sentries).not.to.include(sentry);
      expect(sentry.$parent).not.to.exist;
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(host.$parent.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host.$parent);
    }));

  });


  describe('attach to task (inside plan fragment)', function() {

    var diagramXML = require('./SentryUpdater.add.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementFactory) {
      criterionShape = elementFactory.createCriterionShape('cmmn:ExitCriterion');
      var criterion = criterionShape.businessObject;
      sentry = criterion.sentryRef;
    }));

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var hostShape = elementRegistry.get('PI_Task_2');
      host = hostShape.businessObject;

      // when
      modeling.createShape(criterionShape, { x: 440, y: 170 }, hostShape, ATTACH);
    }));

    it('should execute', function() {
      // when
      expect(host.$parent.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host.$parent);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(host.$parent.sentries).not.to.include(sentry);
      expect(sentry.$parent).not.to.exist;
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(host.$parent.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host.$parent);
    }));

  });


  describe('attach to item which is discretionary to stage', function() {

    var diagramXML = require('./SentryUpdater.discretionary-to-stage.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementFactory) {
      criterionShape = elementFactory.createCriterionShape('cmmn:ExitCriterion');
      var criterion = criterionShape.businessObject;
      sentry = criterion.sentryRef;
    }));

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var hostShape = elementRegistry.get('DIS_HumanTask_1');
      host = hostShape.businessObject;

      // when
      modeling.createShape(criterionShape, { x: 481, y: 260 }, hostShape, ATTACH);
    }));

    it('should execute', function() {
      // when
      expect(host.$parent.$parent.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host.$parent.$parent);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(host.$parent.$parent.sentries).not.to.include(sentry);
      expect(sentry.$parent).not.to.exist;
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(host.$parent.$parent.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host.$parent.$parent);
    }));

  });

  describe('attach to item which is discretionary to human task', function() {

    var diagramXML = require('./SentryUpdater.discretionary-to-human-task.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementFactory) {
      criterionShape = elementFactory.createCriterionShape('cmmn:ExitCriterion');
      var criterion = criterionShape.businessObject;
      sentry = criterion.sentryRef;
    }));

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var hostShape = elementRegistry.get('DIS_Task_1');
      host = hostShape.businessObject;

      // when
      modeling.createShape(criterionShape, { x: 657, y: 260 }, hostShape, ATTACH);
    }));

    it('should execute', function() {
      // when
      expect(host.definitionRef.$parent.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host.definitionRef.$parent);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(host.definitionRef.$parent.sentries).not.to.include(sentry);
      expect(sentry.$parent).not.to.exist;
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(host.definitionRef.$parent.sentries).to.include(sentry);
      expect(sentry.$parent).to.equal(host.definitionRef.$parent);
    }));

  });

});
