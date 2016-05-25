'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #PlanningTableUpdater', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('add', function() {

    var diagramXML = require('./PlanningTableUpdater.add.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var taskShape, discretionaryItem;

    beforeEach(inject(function(elementFactory) {
      // given
      taskShape = elementFactory.createDiscretionaryItemShape('cmmn:Task');
      discretionaryItem = taskShape.businessObject;
    }));

    describe('to case plan model', function() {

      var casePlanModel;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var newParent = elementRegistry.get('CasePlanModel_1');
        casePlanModel = newParent.businessObject;

        // when
        modeling.createShape(taskShape, { x: 100, y: 100 }, newParent);
      }));

      describe('create planning table', function() {


        it('should execute', function() {
          expect(casePlanModel.planningTable).to.exist;
          expect(casePlanModel.planningTable.$parent).to.equal(casePlanModel);
        });


        it('should undo', inject(function(commandStack) {
          // when
          var planningTable = casePlanModel.planningTable;
          commandStack.undo();

          // then
          expect(casePlanModel.planningTable).not.to.exist;
          expect(planningTable.$parent).not.to.exist;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(casePlanModel.planningTable).to.exist;
          expect(casePlanModel.planningTable.$parent).to.equal(casePlanModel);
        }));

      });


      describe('add discretionary item to planning table', function() {


        it('should execute', function() {
          expect(casePlanModel.planningTable.get('tableItems')).to.include(discretionaryItem);
        });


        it('should undo', inject(function(commandStack) {
          // when
          var planningTable = casePlanModel.planningTable;
          commandStack.undo();

          // then
          expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(casePlanModel.planningTable.get('tableItems')).to.include(discretionaryItem);
        }));

      });

    });


    describe('to stage', function() {

      var stage;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var newParent = elementRegistry.get('PI_Stage_1');
        stage = newParent.businessObject.definitionRef;

        // when
        modeling.createShape(taskShape, { x: 300, y: 150 }, newParent);
      }));

      describe('create planning table', function() {


        it('should execute', function() {
          expect(stage.planningTable).to.exist;
          expect(stage.planningTable.$parent).to.equal(stage);
        });


        it('should undo', inject(function(commandStack) {
          // when
          var planningTable = stage.planningTable;
          commandStack.undo();

          // then
          expect(stage.planningTable).not.to.exist;
          expect(planningTable.$parent).not.to.exist;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.planningTable).to.exist;
          expect(stage.planningTable.$parent).to.equal(stage);
        }));

      });


      describe('add discretionary item to planning table', function() {


        it('should execute', function() {
          expect(stage.planningTable.get('tableItems')).to.include(discretionaryItem);
        });


        it('should undo', inject(function(commandStack) {
          // when
          var planningTable = stage.planningTable;
          commandStack.undo();

          // then
          expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.planningTable.get('tableItems')).to.include(discretionaryItem);
        }));

      });

    });

    describe('to stage with planning table', function() {

      var stage, planningTable;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var newParent = elementRegistry.get('PI_Stage_3');
        stage = newParent.businessObject.definitionRef;
        planningTable = stage.planningTable;

        // when
        modeling.createShape(taskShape, { x: 525, y: 140 }, newParent);
      }));

      describe('keep planning table', function() {


        it('should execute', function() {
          expect(stage.planningTable).to.equal(planningTable);
          expect(stage.planningTable.$parent).to.equal(stage);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(stage.planningTable).to.equal(planningTable);
          expect(stage.planningTable.$parent).to.equal(stage);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.planningTable).to.equal(planningTable);
          expect(stage.planningTable.$parent).to.equal(stage);
        }));

      });


      describe('add discretionary item to planning table', function() {


        it('should execute', function() {
          expect(stage.planningTable.get('tableItems')).to.have.length(2);
          expect(stage.planningTable.get('tableItems')).to.include(discretionaryItem);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(stage.planningTable.get('tableItems')).to.have.length(1);
          expect(stage.planningTable.get('tableItems')).not.to.include(discretionaryItem);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.planningTable.get('tableItems')).to.have.length(2);
          expect(stage.planningTable.get('tableItems')).to.include(discretionaryItem);
        }));

      });

    });

  });

});
