'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - #remove plan item', function() {

  var diagramXML = require('./RemovePlanItem.cmmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  describe('task', function() {

    var casePlanModel, taskPlanItem;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var taskShape = elementRegistry.get('PI_Task_1');
      taskPlanItem = taskShape.businessObject;

      casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

      // when
      modeling.removeShape(taskShape);
    }));

    it('should execute', function() {
      expect(casePlanModel.planItems).not.to.include(taskPlanItem);
      expect(taskPlanItem.$parent).to.be.null;
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(casePlanModel.planItems).to.include(taskPlanItem);
      expect(taskPlanItem.$parent).to.equal(casePlanModel);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(casePlanModel.planItems).not.to.include(taskPlanItem);
      expect(taskPlanItem.$parent).to.be.null;
    }));

  });


  describe('nested task', function() {

    var stage, taskPlanItem;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var taskShape = elementRegistry.get('PI_Task_2');
      taskPlanItem = taskShape.businessObject;

      stage = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

      // when
      modeling.removeShape(taskShape);
    }));

    it('should execute', function() {
      expect(stage.planItems).not.to.include(taskPlanItem);
      expect(taskPlanItem.$parent).to.be.null;
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(stage.planItems).to.include(taskPlanItem);
      expect(taskPlanItem.$parent).to.equal(stage);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(stage.planItems).not.to.include(taskPlanItem);
      expect(taskPlanItem.$parent).to.be.null;
    }));

  });


  describe('stage', function() {

    var casePlanModel, stage, stagePlanItem, taskPlanItem;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      taskPlanItem = elementRegistry.get('PI_Task_2').businessObject;

      var shape = elementRegistry.get('PI_Stage_1');
      stagePlanItem = shape.businessObject;
      stage = stagePlanItem.definitionRef;

      casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

      // when
      modeling.removeShape(shape);
    }));

    it('should execute', function() {
      expect(casePlanModel.planItems).not.to.include(stagePlanItem);
      expect(stagePlanItem.$parent).to.be.null;

      expect(stage.planItems).not.to.include(taskPlanItem);
      expect(taskPlanItem.$parent).to.be.null;
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(casePlanModel.planItems).to.include(stagePlanItem);
      expect(stagePlanItem.$parent).to.equal(casePlanModel);

      expect(stage.planItems).to.include(taskPlanItem);
      expect(taskPlanItem.$parent).to.equal(stage);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(casePlanModel.planItems).not.to.include(stagePlanItem);
      expect(stagePlanItem.$parent).to.be.null;

      expect(stage.planItems).not.to.include(taskPlanItem);
      expect(taskPlanItem.$parent).to.be.null;
    }));

  });

});
