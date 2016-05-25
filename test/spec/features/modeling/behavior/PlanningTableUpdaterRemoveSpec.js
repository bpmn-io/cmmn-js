'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #PlanningTableUpdater', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('remove', function() {

    var diagramXML = require('./PlanningTableUpdater.remove.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    describe('from case plan model', function() {

      var discretionaryItem, casePlanModel, planningTable;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('DIS_HumanTask_1');
        discretionaryItem = shape.businessObject;

        casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;
        planningTable = casePlanModel.planningTable;

        // when
        modeling.removeShape(shape);
      }));

      describe('remove planning table', function() {


        it('should execute', function() {
          expect(casePlanModel.planningTable).not.to.exist;
          expect(planningTable.$parent).not.to.exist;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(casePlanModel.planningTable).to.exist;
          expect(casePlanModel.planningTable).to.equal(planningTable);
          expect(casePlanModel.planningTable.$parent).to.equal(casePlanModel);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(casePlanModel.planningTable).not.to.exist;
          expect(planningTable.$parent).not.to.exist;
        }));

      });


      describe('remove discretionary item from planning table', function() {


        it('should execute', function() {
          expect(planningTable.get('tableItems')).to.be.empty;
          expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(planningTable.get('tableItems')).to.have.length(1);
          expect(planningTable.get('tableItems')).to.include(discretionaryItem);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(planningTable.get('tableItems')).to.be.empty;
          expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
        }));

      });

    });


    describe('from stage', function() {

      var discretionaryItem, stage, planningTable;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('DIS_HumanTask_2');
        discretionaryItem = shape.businessObject;

        stage = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;
        planningTable = stage.planningTable;

        // when
        modeling.removeShape(shape);
      }));

      describe('remove planning table', function() {


        it('should execute', function() {
          expect(stage.planningTable).not.to.exist;
          expect(planningTable.$parent).not.to.exist;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(stage.planningTable).to.exist;
          expect(stage.planningTable).to.equal(planningTable);
          expect(stage.planningTable.$parent).to.equal(stage);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.planningTable).not.to.exist;
          expect(planningTable.$parent).not.to.exist;
        }));

      });


      describe('remove discretionary item from planning table', function() {


        it('should execute', function() {
          expect(planningTable.get('tableItems')).to.be.empty;
          expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(planningTable.get('tableItems')).to.have.length(1);
          expect(planningTable.get('tableItems')).to.include(discretionaryItem);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(planningTable.get('tableItems')).to.be.empty;
          expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
        }));

      });

    });

    describe('from stage with multiple discretionary items', function() {

      var discretionaryItem, stage, planningTable;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('DIS_HumanTask_3');
        discretionaryItem = shape.businessObject;

        stage = elementRegistry.get('PI_Stage_3').businessObject.definitionRef;
        planningTable = stage.planningTable;

        // when
        modeling.removeShape(shape);
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


      describe('remove discretionary item from planning table', function() {


        it('should execute', function() {
          expect(stage.planningTable.get('tableItems')).to.have.length(1);
          expect(stage.planningTable.get('tableItems')).not.to.include(discretionaryItem);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(stage.planningTable.get('tableItems')).to.have.length(2);
          expect(stage.planningTable.get('tableItems')).to.include(discretionaryItem);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.planningTable.get('tableItems')).to.have.length(1);
          expect(stage.planningTable.get('tableItems')).not.to.include(discretionaryItem);
        }));

      });

    });

  });

});
