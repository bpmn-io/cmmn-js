'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #PlanItemDefinitionUpdater', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('add', function() {

    var diagramXML = require('./PlanItemDefinitionUpdater.add.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('plan item: ', function() {

      describe('plan item definition', function() {

        var taskShape, planItemDefinition;

        beforeEach(inject(function(elementFactory) {
          // given
          taskShape = elementFactory.createPlanItemShape('cmmn:Task');
          planItemDefinition = taskShape.businessObject.definitionRef;
        }));

        describe('to case plan model', function() {

          var casePlanModel;

          beforeEach(inject(function(elementFactory, elementRegistry, modeling) {
            // given
            var shape = elementRegistry.get('CasePlanModel_1');
            casePlanModel = shape.businessObject;

            // when
            modeling.createShape(taskShape, { x: 250, y: 290 }, shape);
          }));


          it('should execute', function() {
            expect(casePlanModel.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(casePlanModel);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(casePlanModel.planItemDefinitions).not.to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.be.null;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(casePlanModel.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(casePlanModel);
          }));

        });

        describe('to case plan model when adding item to a nested plan fragment', function() {

          var casePlanModel;

          beforeEach(inject(function(elementFactory, elementRegistry, modeling) {
            // given
            var shape = elementRegistry.get('DIS_PlanFragment_1');

            casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

            // when
            modeling.createShape(taskShape, { x: 450, y: 150 }, shape);
          }));


          it('should execute', function() {
            expect(casePlanModel.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(casePlanModel);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(casePlanModel.planItemDefinitions).not.to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.be.null;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(casePlanModel.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(casePlanModel);
          }));

        });

        describe('to nested stage', function() {

          var stage;

          beforeEach(inject(function(elementFactory, elementRegistry, modeling) {
            // given
            var shape = elementRegistry.get('PI_Stage_1');
            stage = shape.businessObject.definitionRef;

            // when
            modeling.createShape(taskShape, { x: 700, y: 150 }, shape);
          }));


          it('should execute', function() {
            expect(stage.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(stage);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(stage.planItemDefinitions).not.to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.be.null;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(stage.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(stage);
          }));

        });

        describe('to nested stage when adding item to a nested plan fragment', function() {

          var stage;

          beforeEach(inject(function(elementFactory, elementRegistry, modeling) {
            // given
            var shape = elementRegistry.get('DIS_PlanFragment_2');

            stage = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

            // when
            modeling.createShape(taskShape, { x: 700, y: 240 }, shape);
          }));


          it('should execute', function() {
            expect(stage.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(stage);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(stage.planItemDefinitions).not.to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.be.null;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(stage.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(stage);
          }));

        });

      });

    });

    describe('discretionary item: ', function() {

      describe('plan item definition', function() {

        var taskShape, planItemDefinition;

        beforeEach(inject(function(elementFactory) {
          // given
          taskShape = elementFactory.createDiscretionaryItemShape('cmmn:Task');
          planItemDefinition = taskShape.businessObject.definitionRef;
        }));

        describe('to case plan model', function() {

          var casePlanModel;

          beforeEach(inject(function(elementFactory, elementRegistry, modeling) {
            // given
            var shape = elementRegistry.get('CasePlanModel_1');
            casePlanModel = shape.businessObject;

            // when
            modeling.createShape(taskShape, { x: 250, y: 290 }, shape);
          }));

          it('should execute', function() {
            expect(casePlanModel.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(casePlanModel);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(casePlanModel.planItemDefinitions).not.to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.be.null;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(casePlanModel.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(casePlanModel);
          }));

        });

        describe('to nested stage', function() {

          var stage;

          beforeEach(inject(function(elementFactory, elementRegistry, modeling) {
            // given
            var shape = elementRegistry.get('PI_Stage_1');
            stage = shape.businessObject.definitionRef;

            // when
            modeling.createShape(taskShape, { x: 700, y: 150 }, shape);
          }));


          it('should execute', function() {
            expect(stage.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(stage);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(stage.planItemDefinitions).not.to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.be.null;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(stage.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(stage);
          }));

        });

      });

    });

    describe('plan fragment: ', function() {

      describe('plan item definition', function() {

        var planFragmentShape, planItemDefinition;

        beforeEach(inject(function(elementFactory) {
          // given
          planFragmentShape = elementFactory.createDiscretionaryItemShape('cmmn:PlanFragment');
          planItemDefinition = planFragmentShape.businessObject.definitionRef;
        }));

        describe('to case plan model', function() {

          var casePlanModel;

          beforeEach(inject(function(elementFactory, elementRegistry, modeling) {
            // given
            var shape = elementRegistry.get('CasePlanModel_1');
            casePlanModel = shape.businessObject;

            // when
            modeling.createShape(planFragmentShape, { x: 250, y: 290 }, shape);
          }));

          it('should execute', function() {
            expect(casePlanModel.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(casePlanModel);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(casePlanModel.planItemDefinitions).not.to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.be.null;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(casePlanModel.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(casePlanModel);
          }));

        });

        describe('to nested stage', function() {

          var stage;

          beforeEach(inject(function(elementFactory, elementRegistry, modeling) {
            // given
            var shape = elementRegistry.get('PI_Stage_1');
            stage = shape.businessObject.definitionRef;

            // when
            modeling.createShape(planFragmentShape, { x: 700, y: 150 }, shape);
          }));


          it('should execute', function() {
            expect(stage.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(stage);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(stage.planItemDefinitions).not.to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.be.null;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(stage.planItemDefinitions).to.include(planItemDefinition);
            expect(planItemDefinition.$parent).to.equal(stage);
          }));

        });

      });

    });

  });

});
