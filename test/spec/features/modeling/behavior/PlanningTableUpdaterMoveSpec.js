'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core'),
    getParents = require('../../../../../lib/features/modeling/util/ModelingUtil').getParents;

var filter = require('min-dash').filter;


describe('features/modeling - #PlanningTableUpdater', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('move', function() {

    var source, target, shape, oldPlanningTable, discretionaryItem;

    var diagramXML = require('./PlanningTableUpdater.move.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('from case plan model', function() {

      beforeEach(inject(function(elementRegistry) {
        // given
        var sourceShape = elementRegistry.get('CasePlanModel_1');
        source = sourceShape.businessObject;
        oldPlanningTable = source.planningTable;

        shape = elementRegistry.get('DIS_HumanTask_1');
        discretionaryItem = shape.businessObject;
      }));

      describe('to stage', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var targetShape = elementRegistry.get('PI_Stage_4');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveElements([ shape ], { x: 640, y: 280 }, targetShape);

        }));

        describe('create planning table', function() {


          it('should execute', function() {
            expect(source.planningTable).not.to.exist;
            expect(oldPlanningTable.$parent).not.to.exist;

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          });


          it('should undo', inject(function(commandStack) {
            // when
            var planningTable = target.planningTable;
            commandStack.undo();

            // then
            expect(source.planningTable).to.exist;
            expect(source.planningTable).to.equal(oldPlanningTable);
            expect(source.planningTable.$parent).to.equal(source);

            expect(target.planningTable).not.to.exist;
            expect(planningTable.$parent).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(source.planningTable).not.to.exist;
            expect(oldPlanningTable.$parent).not.to.exist;

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          }));

        });


        describe('add discretionary item to planning table', function() {


          it('should execute', function() {
            expect(target.planningTable.get('tableItems')).to.have.length(1);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          });


          it('should undo', inject(function(commandStack) {
            // when
            var planningTable = target.planningTable;
            commandStack.undo();

            // then
            expect(planningTable.get('tableItems')).to.have.length(0);
            expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).to.include(discretionaryItem);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(target.planningTable.get('tableItems')).to.have.length(1);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          }));

        });

      });


      describe('to stage with discretionary items', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var targetShape = elementRegistry.get('PI_Stage_1');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveElements([ shape ], { x: 200, y: 50 }, targetShape);

        }));

        describe('keep planning table', function() {


          it('should execute', function() {
            expect(source.planningTable).not.to.exist;
            expect(oldPlanningTable.$parent).not.to.exist;

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(source.planningTable).to.exist;
            expect(source.planningTable).to.equal(oldPlanningTable);
            expect(source.planningTable.$parent).to.equal(source);

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(source.planningTable).not.to.exist;
            expect(oldPlanningTable.$parent).not.to.exist;

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          }));

        });


        describe('add discretionary item to planning table', function() {


          it('should execute', function() {
            expect(target.planningTable.get('tableItems')).to.have.length(2);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(target.planningTable.get('tableItems')).to.have.length(1);
            expect(target.planningTable.get('tableItems')).not.to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).to.include(discretionaryItem);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(target.planningTable.get('tableItems')).to.have.length(2);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          }));

        });

      });


      describe('to another case', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var targetShape = elementRegistry.get('CasePlanModel_2');
          target = targetShape.businessObject;

          // when
          modeling.moveElements([ shape ], { x: 950, y: 0 }, targetShape);

        }));

        describe('create planning table', function() {


          it('should execute', function() {
            expect(source.planningTable).not.to.exist;
            expect(oldPlanningTable.$parent).not.to.exist;

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          });


          it('should undo', inject(function(commandStack) {
            // when
            var planningTable = target.planningTable;
            commandStack.undo();

            // then
            expect(source.planningTable).to.exist;
            expect(source.planningTable).to.equal(oldPlanningTable);
            expect(source.planningTable.$parent).to.equal(source);

            expect(target.planningTable).not.to.exist;
            expect(planningTable.$parent).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(source.planningTable).not.to.exist;
            expect(oldPlanningTable.$parent).not.to.exist;

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          }));

        });


        describe('add discretionary item to planning table', function() {


          it('should execute', function() {
            expect(target.planningTable.get('tableItems')).to.have.length(1);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          });


          it('should undo', inject(function(commandStack) {
            // when
            var planningTable = target.planningTable;
            commandStack.undo();

            // then
            expect(planningTable.get('tableItems')).to.have.length(0);
            expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).to.include(discretionaryItem);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(target.planningTable.get('tableItems')).to.have.length(1);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          }));

        });

      });

    });

    describe('from stage', function() {

      beforeEach(inject(function(elementRegistry) {
        // given
        var sourceShape = elementRegistry.get('PI_Stage_1');
        source = sourceShape.businessObject.definitionRef;
        oldPlanningTable = source.planningTable;

        shape = elementRegistry.get('DIS_HumanTask_2');
        discretionaryItem = shape.businessObject;
      }));

      describe('to case plan model', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var targetShape = elementRegistry.get('CasePlanModel_1');
          target = targetShape.businessObject;

          // when
          modeling.moveElements([ shape ], { x: -200, y: 125 }, targetShape);

        }));

        describe('delete planning table', function() {


          it('should execute', function() {
            expect(source.planningTable).not.to.exist;
            expect(oldPlanningTable.$parent).not.to.exist;

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(source.planningTable).to.exist;
            expect(source.planningTable).to.equal(oldPlanningTable);
            expect(source.planningTable.$parent).to.equal(source);

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(source.planningTable).not.to.exist;
            expect(oldPlanningTable.$parent).not.to.exist;

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          }));

        });


        describe('add discretionary item to planning table', function() {


          it('should execute', function() {
            expect(target.planningTable.get('tableItems')).to.have.length(2);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          });


          it('should undo', inject(function(commandStack) {
            // when
            var planningTable = target.planningTable;
            commandStack.undo();

            // then
            expect(planningTable.get('tableItems')).to.have.length(1);
            expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).to.include(discretionaryItem);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(target.planningTable.get('tableItems')).to.have.length(2);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          }));

        });

      });


      describe('to stage without discretionary items', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var targetShape = elementRegistry.get('PI_Stage_4');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveElements([ shape ], { x: 430, y: 280 }, targetShape);

        }));

        describe('create planning table', function() {


          it('should execute', function() {
            expect(source.planningTable).not.to.exist;
            expect(oldPlanningTable.$parent).not.to.exist;

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          });


          it('should undo', inject(function(commandStack) {
            // when
            var planningTable = target.planningTable;
            commandStack.undo();

            // then
            expect(source.planningTable).to.exist;
            expect(source.planningTable).to.equal(oldPlanningTable);
            expect(source.planningTable.$parent).to.equal(source);

            expect(target.planningTable).not.to.exist;
            expect(planningTable.$parent).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(source.planningTable).not.to.exist;
            expect(oldPlanningTable.$parent).not.to.exist;

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          }));

        });


        describe('add discretionary item to planning table', function() {


          it('should execute', function() {
            expect(target.planningTable.get('tableItems')).to.have.length(1);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          });


          it('should undo', inject(function(commandStack) {
            // when
            var planningTable = target.planningTable;
            commandStack.undo();

            // then
            expect(planningTable.get('tableItems')).to.have.length(0);
            expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).to.include(discretionaryItem);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(target.planningTable.get('tableItems')).to.have.length(1);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          }));

        });

      });


      describe('to another case', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var targetShape = elementRegistry.get('CasePlanModel_2');
          target = targetShape.businessObject;

          // when
          modeling.moveElements([ shape ], { x: 750, y: 0 }, targetShape);

        }));

        describe('create planning table', function() {


          it('should execute', function() {
            expect(source.planningTable).not.to.exist;
            expect(oldPlanningTable.$parent).not.to.exist;

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          });


          it('should undo', inject(function(commandStack) {
            // when
            var planningTable = target.planningTable;
            commandStack.undo();

            // then
            expect(source.planningTable).to.exist;
            expect(source.planningTable).to.equal(oldPlanningTable);
            expect(source.planningTable.$parent).to.equal(source);

            expect(target.planningTable).not.to.exist;
            expect(planningTable.$parent).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(source.planningTable).not.to.exist;
            expect(oldPlanningTable.$parent).not.to.exist;

            expect(target.planningTable).to.exist;
            expect(target.planningTable.$parent).to.equal(target);
          }));

        });


        describe('add discretionary item to planning table', function() {


          it('should execute', function() {
            expect(target.planningTable.get('tableItems')).to.have.length(1);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          });


          it('should undo', inject(function(commandStack) {
            // when
            var planningTable = target.planningTable;
            commandStack.undo();

            // then
            expect(planningTable.get('tableItems')).to.have.length(0);
            expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).to.include(discretionaryItem);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(target.planningTable.get('tableItems')).to.have.length(1);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          }));

        });

      });

    });

    describe('to same stage', function() {

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var sourceShape = elementRegistry.get('PI_Stage_1');
        source = sourceShape.businessObject.definitionRef;
        oldPlanningTable = source.planningTable;

        shape = elementRegistry.get('DIS_HumanTask_2');
        discretionaryItem = shape.businessObject;

        var targetShape = elementRegistry.get('PI_Stage_1');
        target = targetShape.businessObject.definitionRef;

        // when
        modeling.moveElements([ shape ], { x: 0, y: 70 }, targetShape);
      }));

      it('should execute', function() {
        expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);

        expect(discretionaryItem.$parent).to.equal(oldPlanningTable);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);

        expect(discretionaryItem.$parent).to.equal(oldPlanningTable);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);

        expect(discretionaryItem.$parent).to.equal(oldPlanningTable);
      }));

    });

  });

  describe('move planning table', function() {

    var diagramXML = require('./PlanningTableUpdater.move-to-case-plan.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('should be kept by old definition', function() {

      var oldDefinition, newDefinition, planningTable;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('PI_HumanTask_1_2');
        var targetShape = elementRegistry.get('CasePlanModel_2');

        oldDefinition = shape.businessObject.definitionRef;
        planningTable = oldDefinition.planningTable;

        // when
        modeling.moveElements([ shape ], { x: 450, y: 0 }, targetShape);

        newDefinition = shape.businessObject.definitionRef;
      }));


      it('should execute', function() {
        // then
        expect(oldDefinition.planningTable).to.exist;
        expect(oldDefinition.planningTable).to.equal(planningTable);

        expect(newDefinition.planningTable).not.to.exist;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldDefinition.planningTable).to.exist;
        expect(oldDefinition.planningTable).to.equal(planningTable);

        expect(newDefinition.planningTable).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldDefinition.planningTable).to.exist;
        expect(oldDefinition.planningTable).to.equal(planningTable);

        expect(newDefinition.planningTable).not.to.exist;
      }));

    });


    describe('should be kept by new definition', function() {

      var oldDefinition, newDefinition, planningTable;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape1 = elementRegistry.get('PI_HumanTask_1_2');
        var shape2 = elementRegistry.get('DIS_Task_1');
        var shape3 = elementRegistry.get('DIS_Task_2');

        var targetShape = elementRegistry.get('CasePlanModel_2');

        oldDefinition = shape1.businessObject.definitionRef;

        // when
        modeling.moveElements([ shape1, shape2, shape3 ], { x: 450, y: 0 }, targetShape);

        newDefinition = shape1.businessObject.definitionRef;
        planningTable = newDefinition.planningTable;
      }));


      it('should execute', function() {
        // then
        expect(newDefinition.planningTable).to.exist;
        expect(newDefinition.planningTable).to.equal(planningTable);
        expect(planningTable.$parent).to.equal(newDefinition);

        expect(oldDefinition.planningTable).not.to.exist;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldDefinition.planningTable).to.exist;
        expect(oldDefinition.planningTable).to.equal(planningTable);
        expect(planningTable.$parent).to.equal(oldDefinition);

        expect(newDefinition.planningTable).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newDefinition.planningTable).to.exist;
        expect(newDefinition.planningTable).to.equal(planningTable);
        expect(planningTable.$parent).to.equal(newDefinition);

        expect(oldDefinition.planningTable).not.to.exist;
      }));

    });


    describe('should create new planning table', function() {

      var oldDefinition, newDefinition, oldPlanningTable, newPlanningTable, disTask2, disTask3;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape1 = elementRegistry.get('PI_HumanTask_1_2');
        var shape2 = elementRegistry.get('DIS_Task_2');

        var targetShape = elementRegistry.get('CasePlanModel_2');

        oldDefinition = shape1.businessObject.definitionRef;
        oldPlanningTable = oldDefinition.planningTable;

        disTask2 = shape2.businessObject;
        disTask3 = elementRegistry.get('DIS_Task_1').businessObject;

        // when
        modeling.moveElements([ shape1, shape2 ], { x: 450, y: 0 }, targetShape);

        newDefinition = shape1.businessObject.definitionRef;
        newPlanningTable = newDefinition.planningTable;

      }));


      it('should execute', function() {
        // then
        expect(newDefinition.planningTable).to.exist;
        expect(newDefinition.planningTable).to.equal(newPlanningTable);
        expect(newPlanningTable.$parent).to.equal(newDefinition);

        expect(newPlanningTable.get('tableItems')).to.include(disTask2);
        expect(newPlanningTable.get('tableItems')).not.to.include(disTask3);

        expect(oldDefinition.planningTable).to.exist;
        expect(oldDefinition.planningTable).to.equal(oldPlanningTable);
        expect(oldPlanningTable.$parent).to.equal(oldDefinition);

        expect(oldPlanningTable.get('tableItems')).not.to.include(disTask2);
        expect(oldPlanningTable.get('tableItems')).to.include(disTask3);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldDefinition.planningTable).to.exist;
        expect(oldDefinition.planningTable).to.equal(oldPlanningTable);
        expect(oldPlanningTable.$parent).to.equal(oldDefinition);

        expect(oldPlanningTable.get('tableItems')).to.include(disTask2);
        expect(oldPlanningTable.get('tableItems')).to.include(disTask3);

        expect(newDefinition.planningTable).not.to.exist;
        expect(newPlanningTable.$parent).not.to.exist;

        expect(newPlanningTable.get('tableItems')).not.to.include(disTask2);
        expect(newPlanningTable.get('tableItems')).not.to.include(disTask3);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newDefinition.planningTable).to.exist;
        expect(newDefinition.planningTable).to.equal(newPlanningTable);
        expect(newPlanningTable.$parent).to.equal(newDefinition);

        expect(newPlanningTable.get('tableItems')).to.include(disTask2);
        expect(newPlanningTable.get('tableItems')).not.to.include(disTask3);

        expect(oldDefinition.planningTable).to.exist;
        expect(oldDefinition.planningTable).to.equal(oldPlanningTable);
        expect(oldPlanningTable.$parent).to.equal(oldDefinition);

        expect(oldPlanningTable.get('tableItems')).not.to.include(disTask2);
        expect(oldPlanningTable.get('tableItems')).to.include(disTask3);
      }));

    });


    describe('should duplicate planning table structure', function() {

      var oldDefinition, newDefinition, oldPlanningTable, newPlanningTable, disTask3, disTask4;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var shape = elementRegistry.get('PI_HumanTask_2_1');
        var shape3 = elementRegistry.get('DIS_Task_3');
        var shape4 = elementRegistry.get('DIS_Task_4');

        var targetShape = elementRegistry.get('CasePlanModel_2');

        oldDefinition = shape.businessObject.definitionRef;
        oldPlanningTable = oldDefinition.planningTable;

        disTask3 = shape3.businessObject;
        disTask4 = shape4.businessObject;

        // when
        modeling.moveElements([ shape, shape3, shape4 ], { x: 450, y: 0 }, targetShape);

        newDefinition = shape.businessObject.definitionRef;
        newPlanningTable = newDefinition.planningTable;
      }));


      it('should execute', function() {
        // then
        var disTask3Parents = getParents(disTask3, 'cmmn:PlanningTable');
        var disTask4Parents = getParents(disTask4, 'cmmn:PlanningTable');

        expect(disTask3Parents).to.have.length(6);
        expect(disTask3Parents[5]).to.equals(newPlanningTable);

        expect(disTask4Parents).to.have.length(7);
        expect(disTask4Parents[6]).to.equals(newPlanningTable);

        expect(intersection(disTask3Parents, disTask4Parents)).to.have.length(5);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        var disTask3Parents = getParents(disTask3, 'cmmn:PlanningTable');
        var disTask4Parents = getParents(disTask4, 'cmmn:PlanningTable');

        expect(disTask3Parents).to.have.length(6);
        expect(disTask3Parents[5]).to.equals(oldPlanningTable);

        expect(disTask4Parents).to.have.length(7);
        expect(disTask4Parents[6]).to.equals(oldPlanningTable);

        expect(intersection(disTask3Parents, disTask4Parents)).to.have.length(5);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var disTask3Parents = getParents(disTask3, 'cmmn:PlanningTable');
        var disTask4Parents = getParents(disTask4, 'cmmn:PlanningTable');

        expect(disTask3Parents).to.have.length(6);
        expect(disTask3Parents[5]).to.equals(newPlanningTable);

        expect(disTask4Parents).to.have.length(7);
        expect(disTask4Parents[6]).to.equals(newPlanningTable);

        expect(intersection(disTask3Parents, disTask4Parents)).to.have.length(5);
      }));

    });

  });

});


// helpers /////////////////


function intersection(a, b) {

  return filter(a, function(e) {
    return b.indexOf(e) !== -1;
  });
}