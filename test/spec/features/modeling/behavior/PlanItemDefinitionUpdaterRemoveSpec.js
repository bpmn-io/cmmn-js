'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #PlanItemDefinitionUpdater', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('remove plan item definition when removing', function() {

    var diagramXML = require('./PlanItemDefinitionUpdater.simple-remove.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('plan item', function() {

      var casePlanModel, taskDefinition;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('PI_Task_1');
        taskDefinition = shape.businessObject.definitionRef;

        casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

        // when
        modeling.removeShape(shape);
      }));


      it('should execute', function() {
        expect(casePlanModel.planItemDefinitions).not.to.include(taskDefinition);
        expect(taskDefinition.$parent).to.be.null;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(casePlanModel.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(casePlanModel);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(casePlanModel.planItemDefinitions).not.to.include(taskDefinition);
        expect(taskDefinition.$parent).to.be.null;
      }));

    });


    describe('discretionary item', function() {

      var casePlanModel, taskDefinition;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('DIS_Task_2');
        taskDefinition = shape.businessObject.definitionRef;

        casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

        // when
        modeling.removeShape(shape);
      }));


      it('should execute', function() {
        expect(casePlanModel.planItemDefinitions).not.to.include(taskDefinition);
        expect(taskDefinition.$parent).to.be.null;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(casePlanModel.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(casePlanModel);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(casePlanModel.planItemDefinitions).not.to.include(taskDefinition);
        expect(taskDefinition.$parent).to.be.null;
      }));

    });


    describe('plan item inside stage', function() {

      var stage, taskDefinition;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('PI_Task_3');
        taskDefinition = shape.businessObject.definitionRef;

        stage = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

        // when
        modeling.removeShape(shape);
      }));


      it('should execute', function() {
        expect(stage.planItemDefinitions).not.to.include(taskDefinition);
        expect(taskDefinition.$parent).to.be.null;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(stage.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(stage);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(stage.planItemDefinitions).not.to.include(taskDefinition);
        expect(taskDefinition.$parent).to.be.null;
      }));

    });


    describe('discretionary item inside stage', function() {

      var stage, taskDefinition;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('DIS_Task_4');
        taskDefinition = shape.businessObject.definitionRef;

        stage = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

        // when
        modeling.removeShape(shape);
      }));


      it('should execute', function() {
        expect(stage.planItemDefinitions).not.to.include(taskDefinition);
        expect(taskDefinition.$parent).to.be.null;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(stage.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(stage);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(stage.planItemDefinitions).not.to.include(taskDefinition);
        expect(taskDefinition.$parent).to.be.null;
      }));

    });


    describe('plan item inside plan fragment', function() {

      var casePlanModel, taskDefinition;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('PI_Task_5');
        taskDefinition = shape.businessObject.definitionRef;

        casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

        // when
        modeling.removeShape(shape);
      }));


      it('should execute', function() {
        expect(casePlanModel.planItemDefinitions).not.to.include(taskDefinition);
        expect(taskDefinition.$parent).to.be.null;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(casePlanModel.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(casePlanModel);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(casePlanModel.planItemDefinitions).not.to.include(taskDefinition);
        expect(taskDefinition.$parent).to.be.null;
      }));

    });

  });

  describe('should add to previous parent', function() {

    var stage, taskDefinition;

    var diagramXML = require('./PlanItemDefinitionUpdater.different-parents.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var shape = elementRegistry.get('PI_Task_1');
      taskDefinition = shape.businessObject.definitionRef;

      stage = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

      // when
      modeling.removeShape(shape);
    }));


    it('should execute', function() {
      expect(stage.planItemDefinitions).not.to.include(taskDefinition);
      expect(taskDefinition.$parent).to.be.null;
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(stage.planItemDefinitions).to.include(taskDefinition);
      expect(taskDefinition.$parent).to.equal(stage);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(stage.planItemDefinitions).not.to.include(taskDefinition);
      expect(taskDefinition.$parent).to.be.null;
    }));

  });

  describe('remain plan item definition when removing', function() {

    var diagramXML = require('./PlanItemDefinitionUpdater.shared-definition.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('plan item', function() {

      var casePlanModel, taskDefinition;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('PI_Task_1');
        taskDefinition = shape.businessObject.definitionRef;

        casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

        // when
        modeling.removeShape(shape);
      }));


      it('should execute', function() {
        expect(casePlanModel.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(casePlanModel);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(casePlanModel.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(casePlanModel);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(casePlanModel.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(casePlanModel);
      }));

    });


    describe('discretionary item', function() {

      var casePlanModel, taskDefinition;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('DIS_Task_2');
        taskDefinition = shape.businessObject.definitionRef;

        casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

        // when
        modeling.removeShape(shape);
      }));


      it('should execute', function() {
        expect(casePlanModel.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(casePlanModel);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(casePlanModel.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(casePlanModel);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(casePlanModel.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(casePlanModel);
      }));

    });


    describe('plan item inside stage', function() {

      var stage, taskDefinition;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('PI_Task_3');
        taskDefinition = shape.businessObject.definitionRef;

        stage = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

        // when
        modeling.removeShape(shape);
      }));


      it('should execute', function() {
        expect(stage.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(stage);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(stage.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(stage);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(stage.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(stage);
      }));

    });


    describe('discretionary item inside stage', function() {

      var stage, taskDefinition;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('DIS_Task_4');
        taskDefinition = shape.businessObject.definitionRef;

        stage = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

        // when
        modeling.removeShape(shape);
      }));


      it('should execute', function() {
        expect(stage.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(stage);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(stage.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(stage);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(stage.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(stage);
      }));

    });


    describe('plan item inside plan fragment', function() {

      var casePlanModel, taskDefinition;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('PI_Task_5');
        taskDefinition = shape.businessObject.definitionRef;

        casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

        // when
        modeling.removeShape(shape);
      }));


      it('should execute', function() {
        expect(casePlanModel.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(casePlanModel);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(casePlanModel.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(casePlanModel);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(casePlanModel.planItemDefinitions).to.include(taskDefinition);
        expect(taskDefinition.$parent).to.equal(casePlanModel);
      }));

    });

  });

  describe('delete nested planning table', function() {

    var diagramXML = require('./PlanItemDefinitionUpdater.nested-planning-table.cmmn');

    var stage;

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var shape = elementRegistry.get('DIS_HumanTask_1');

      stage = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

      // when
      modeling.removeElements([ shape ]);
    }));


    it('should execute', function() {
      // then
      expect(stage.planningTable).not.to.exist;
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(stage.planningTable).to.exist;
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(stage.planningTable).not.to.exist;
    }));

  });

});
