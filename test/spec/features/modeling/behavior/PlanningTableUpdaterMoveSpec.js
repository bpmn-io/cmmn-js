'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


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
          modeling.moveShape(shape, { x: 640, y: 280 }, targetShape);

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
          modeling.moveShape(shape, { x: 200, y: 50 }, targetShape);

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


      describe('to plan fragment', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var targetShape = elementRegistry.get('DIS_PlanFragment_4');
          target = elementRegistry.get('PI_Stage_3').businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 600, y: 0 }, targetShape);

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
            expect(target.planningTable.get('tableItems')).to.have.length(3);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(target.planningTable.get('tableItems')).to.have.length(2);
            expect(target.planningTable.get('tableItems')).not.to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).to.include(discretionaryItem);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(target.planningTable.get('tableItems')).to.have.length(3);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          }));

        });

      });


      describe('to nested plan fragment', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var targetShape = elementRegistry.get('DIS_PlanFragment_3');
          target = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 370, y: 275 }, targetShape);

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
          modeling.moveShape(shape, { x: 950, y: 0 }, targetShape);

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
          modeling.moveShape(shape, { x: -200, y: 125 }, targetShape);

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
            var planningTable = target.planningTable;
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
          modeling.moveShape(shape, { x: 430, y: 280 }, targetShape);

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


      describe('to plan fragment', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var targetShape = elementRegistry.get('DIS_PlanFragment_4');
          target = elementRegistry.get('PI_Stage_3').businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 400, y: 30 }, targetShape);

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
            expect(target.planningTable.get('tableItems')).to.have.length(3);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(target.planningTable.get('tableItems')).to.have.length(2);
            expect(target.planningTable.get('tableItems')).not.to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).to.include(discretionaryItem);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(target.planningTable.get('tableItems')).to.have.length(3);
            expect(target.planningTable.get('tableItems')).to.include(discretionaryItem);
            expect(oldPlanningTable.get('tableItems')).not.to.include(discretionaryItem);
          }));

        });

      });


      describe('to nested plan fragment', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var targetShape = elementRegistry.get('DIS_PlanFragment_3');
          target = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 165, y: 300 }, targetShape);

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
          modeling.moveShape(shape, { x: 750, y: 0 }, targetShape);

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
        modeling.moveShape(shape, { x: 0, y: 70 }, targetShape);
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

});
