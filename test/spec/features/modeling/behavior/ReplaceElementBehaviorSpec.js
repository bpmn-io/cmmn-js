'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling/behavior - replace element', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('criterion', function() {

    var diagramXML = require('./ReplaceElementBehavior.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules.concat(modelingModule) }));


    it('should execute on attach', inject(function(elementRegistry, elementFactory, modeling) {

      // given
      var casePlanModel = elementRegistry.get('CasePlanModel_1'),
          entryCriterion = elementFactory.createCriterionShape('cmmn:EntryCriterion');

      // when
      var newCriterion = modeling.createShape(entryCriterion, { x: 107, y: 100 }, casePlanModel, true);

      // then
      expect(newCriterion.type).to.equal('cmmn:ExitCriterion');
      expect(newCriterion.businessObject.$parent).to.equal(casePlanModel.businessObject);
      expect(casePlanModel.businessObject.exitCriteria).to.include(newCriterion.businessObject);
    }));


    it('should NOT execute on attach to task', inject(function(elementRegistry, elementFactory, modeling) {

      // given
      var task = elementRegistry.get('PI_Task_1'),
          entryCriterion = elementFactory.createCriterionShape('cmmn:EntryCriterion');

      // when
      var newCriterion = modeling.createShape(entryCriterion, { x: 239, y: 150 }, task, true);

      // then
      expect(newCriterion.type).to.equal('cmmn:EntryCriterion');
      expect(newCriterion.businessObject.$parent).to.equal(task.businessObject);
      expect(task.businessObject.entryCriteria).to.include(newCriterion.businessObject);
    }));


    it('should execute on reattach to case plan model', inject(function(elementRegistry, modeling) {

      // given
      var casePlanModel = elementRegistry.get('CasePlanModel_1'),
          entryCriterion = elementRegistry.get('EntryCriterion_1'),
          sentry = entryCriterion.businessObject.sentryRef;

      // when
      modeling.moveElements([ entryCriterion ], { x: 170, y: 0 }, casePlanModel, true);


      var replacement = elementRegistry.filter(function(element) {
        if(element.businessObject && element.businessObject.sentryRef === sentry) {
          return true;
        }
      })[0];

      // then
      expect(replacement.type).to.equal('cmmn:ExitCriterion');
      expect(replacement.businessObject.$parent).to.equal(casePlanModel.businessObject);
      expect(casePlanModel.businessObject.exitCriteria).to.include(replacement.businessObject);

    }));


    it('should NOT execute on reattach to milestone', inject(function(elementRegistry, modeling) {

      // given
      var milestone = elementRegistry.get('PI_Milestone_1'),
          entryCriterion = elementRegistry.get('EntryCriterion_1'),
          sentry = entryCriterion.businessObject.sentryRef;

      // when
      modeling.moveElements([ entryCriterion ], { x: -10, y: 100 }, milestone, true);


      var criterion = elementRegistry.filter(function(element) {
        if(element.businessObject && element.businessObject.sentryRef === sentry) {
          return true;
        }
      })[0];

      // then
      expect(criterion.type).to.equal('cmmn:EntryCriterion');
      expect(criterion.businessObject.$parent).to.equal(milestone.businessObject);
      expect(milestone.businessObject.entryCriteria).to.include(criterion.businessObject);

    }));


    it('should NOT execute on simple host movement', inject(function(elementRegistry, modeling) {

      // given
      var task = elementRegistry.get('PI_Task_1'),
          entryCriterion = elementRegistry.get('EntryCriterion_1');

      // when
      modeling.moveElements([ task, entryCriterion ], { x: 10, y: 30 }, task.parent);


      // then
      expect(elementRegistry.get('EntryCriterion_1')).to.exist;

      expect(task.attachers).to.have.length(2);
      expect(task.attachers).to.include(entryCriterion);
    }));


    describe('replace exit criterion when setting task non-blocking', function() {

      var element, newCriterion, oldCriterion;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        element = elementRegistry.get('PI_Task_1');
        oldCriterion = elementRegistry.get('ExitCriterion_2');

        // when
        modeling.updateControls(element, { isBlocking: false });

        var sentry = oldCriterion.businessObject.sentryRef;
        newCriterion = elementRegistry.filter(function(element) {
          if(element.businessObject && element.businessObject.sentryRef === sentry) {
            return true;
          }
        })[0];

      }));


      it('should execute', function() {
        // then
        expect(newCriterion.type).to.equal('cmmn:EntryCriterion');
        expect(newCriterion.host).to.equal(element);

        expect(oldCriterion.host).not.to.exist;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(newCriterion.host).not.to.exist;

        expect(oldCriterion.host).to.equal(element);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newCriterion.type).to.equal('cmmn:EntryCriterion');
        expect(newCriterion.host).to.equal(element);

        expect(oldCriterion.host).not.to.exist;
      }));

    });
  });



  describe('on part connection', function() {

    var diagramXML = require('./ReplaceElementBehavior.on-part.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules.concat(modelingModule) }));


    describe('should keep plan item on part connection', function() {

      describe('when reattaching entry criterion to case plan model', function() {

        beforeEach(inject(function(elementRegistry, modeling) {

          // given
          var casePlanModel = elementRegistry.get('CasePlanModel_1');
          var criterion = elementRegistry.get('EntryCriterion_1');

          // when
          modeling.moveElements([ criterion ], { x: 138, y: 0 }, casePlanModel, true);

        }));

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(elementRegistry.get('PlanItemOnPart_1_di')).to.exist;
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get('PlanItemOnPart_1_di')).to.exist;
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(elementRegistry.get('PlanItemOnPart_1_di')).to.exist;
        }));

      });


      describe('when reattaching exit criterion to non-blocking task', function() {

        beforeEach(inject(function(elementRegistry, modeling) {

          // given
          var task = elementRegistry.get('PI_HumanTask_1');
          var criterion = elementRegistry.get('ExitCriterion_1');

          // when
          modeling.moveElements([ criterion ], { x: -50, y: 160 }, task, true);

        }));

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(elementRegistry.get('PlanItemOnPart_2_di')).to.exist;
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get('PlanItemOnPart_2_di')).to.exist;
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(elementRegistry.get('PlanItemOnPart_2_di')).to.exist;
        }));

      });

    });


    describe('should keep case file item on part connection', function() {

      describe('when reattaching entry criterion to case plan model', function() {

        beforeEach(inject(function(elementRegistry, modeling) {

          // given
          var casePlanModel = elementRegistry.get('CasePlanModel_1');
          var criterion = elementRegistry.get('EntryCriterion_2');

          // when
          modeling.moveElements([ criterion ], { x: 138, y: 0 }, casePlanModel, true);

        }));

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(elementRegistry.get('CaseFileItemOnPart_1_di')).to.exist;
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get('CaseFileItemOnPart_1_di')).to.exist;
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(elementRegistry.get('CaseFileItemOnPart_1_di')).to.exist;
        }));

      });


      describe('when reattaching exit criterion to non-blocking task', function() {

        beforeEach(inject(function(elementRegistry, modeling) {

          // given
          var task = elementRegistry.get('PI_HumanTask_1');
          var criterion = elementRegistry.get('ExitCriterion_2');

          // when
          modeling.moveElements([ criterion ], { x: -50, y: 45 }, task, true);

        }));

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(elementRegistry.get('CaseFileItemOnPart_2_di')).to.exist;
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get('CaseFileItemOnPart_2_di')).to.exist;
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(elementRegistry.get('CaseFileItemOnPart_2_di')).to.exist;
        }));

      });

    });

  });

  describe('discretionary item', function() {

    var diagramXML = require('./ReplaceElementBehavior.discretionary-item.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules.concat(modelingModule) }));


    describe('create', function() {

      var item, planFragment;

      describe('task', function() {

        beforeEach(inject(function(elementFactory, elementRegistry, modeling) {

          // given
          var shape = elementFactory.createDiscretionaryItemShape('cmmn:Task');

          var target = elementRegistry.get('DIS_PlanFragment_1');
          planFragment = target.businessObject.definitionRef;

          // when
          item = modeling.createShape(shape, { x: 200, y: 300 }, target);

        }));


        it('should execute', function() {
          // then
          expect(item.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(item.businessObject);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(item.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).not.to.include(item.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(item.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(item.businessObject);
        }));

      });


      describe('stage', function() {

        beforeEach(inject(function(elementFactory, elementRegistry, modeling) {

          // given
          var shape = elementFactory.createDiscretionaryItemShape('cmmn:Stage');

          var target = elementRegistry.get('DIS_PlanFragment_1');
          planFragment = target.businessObject.definitionRef;

          // when
          item = modeling.createShape(shape, { x: 300, y: 400 }, target);

        }));


        it('should execute', function() {
          // then
          expect(item.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(item.businessObject);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(item.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).not.to.include(item.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(item.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(item.businessObject);
        }));

      });


      describe('plan fragment', function() {

        beforeEach(inject(function(elementFactory, elementRegistry, modeling) {

          // given
          var shape = elementFactory.createDiscretionaryItemShape('cmmn:PlanFragment');

          var target = elementRegistry.get('DIS_PlanFragment_1');
          planFragment = target.businessObject.definitionRef;

          // when
          item = modeling.createShape(shape, { x: 300, y: 400 }, target);

        }));


        it('should execute', function() {
          // then
          expect(item.type).to.equal('cmmn:PlanItem');
          expect(item.businessObject.definitionRef.$type).to.equal('cmmn:Stage');
          expect(planFragment.get('planItems')).to.include(item.businessObject);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(item.type).to.equal('cmmn:PlanItem');
          expect(item.businessObject.definitionRef.$type).to.equal('cmmn:Stage');
          expect(planFragment.get('planItems')).not.to.include(item.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(item.type).to.equal('cmmn:PlanItem');
          expect(item.businessObject.definitionRef.$type).to.equal('cmmn:Stage');
          expect(planFragment.get('planItems')).to.include(item.businessObject);
        }));

      });

    });


    describe('move', function() {

      var item, newItem, planFragment;

      var findItem;

      beforeEach(inject(function(elementRegistry) {

        findItem = function(definition) {
          return elementRegistry.filter(function(element) {
            if(element.businessObject && element.businessObject.definitionRef === definition) {
              return true;
            }
          })[0];
        }

      }));

      describe('task', function() {

        beforeEach(inject(function(elementFactory, elementRegistry, modeling) {

          // given
          item = elementRegistry.get('DIS_Task_1');

          var target = elementRegistry.get('DIS_PlanFragment_1');
          planFragment = target.businessObject.definitionRef;

          // when
          modeling.moveElements([ item ], { x: 0, y: 150 }, target);

          newItem = findItem(item.businessObject.definitionRef);

        }));


        it('should execute', inject(function(elementRegistry) {
          // then
          expect(elementRegistry.get(item.id)).not.to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(newItem.businessObject);
        }));


        it('should undo', inject(function(commandStack, elementRegistry) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get(item.id)).to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).not.to.include(newItem.businessObject);
        }));


        it('should redo', inject(function(commandStack, elementRegistry) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(elementRegistry.get(item.id)).not.to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(newItem.businessObject);
        }));

      });


      describe('stage', function() {

        beforeEach(inject(function(elementFactory, elementRegistry, modeling) {

          // given
          item = elementRegistry.get('DIS_Stage_1');

          var target = elementRegistry.get('DIS_PlanFragment_1');
          planFragment = target.businessObject.definitionRef;

          // when
          modeling.moveElements([ item ], { x: 0, y: 200 }, target);

          newItem = findItem(item.businessObject.definitionRef);

        }));


        it('should execute', inject(function(elementRegistry) {
          // then
          expect(elementRegistry.get(item.id)).not.to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(newItem.businessObject);
        }));


        it('should undo', inject(function(commandStack, elementRegistry) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get(item.id)).to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).not.to.include(newItem.businessObject);
        }));


        it('should redo', inject(function(commandStack, elementRegistry) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(elementRegistry.get(item.id)).not.to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(newItem.businessObject);
        }));

      });


      describe('plan fragment', function() {

        beforeEach(inject(function(elementFactory, elementRegistry, modeling) {

          // given
          item = elementRegistry.get('DIS_PlanFragment_2');

          var target = elementRegistry.get('DIS_PlanFragment_1');
          planFragment = target.businessObject.definitionRef;

          // when
          modeling.moveElements([ item ], { x: 0, y: 200 }, target);

          newItem = elementRegistry.get(planFragment.get('planItems')[1].id);

        }));


        it('should execute', inject(function(elementRegistry) {
          // then
          expect(elementRegistry.get(item.id)).not.to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(newItem.businessObject);
        }));


        it('should undo', inject(function(commandStack, elementRegistry) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get(item.id)).to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(newItem.businessObject.definitionRef.$type).to.equal('cmmn:Stage');
          expect(planFragment.get('planItems')).not.to.include(newItem.businessObject);
        }));


        it('should redo', inject(function(commandStack, elementRegistry) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(elementRegistry.get(item.id)).not.to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(newItem.businessObject);
        }));

      });


      describe('discretionary to human task', function() {

        var item, planFragment;

        describe('should NOT replace', function() {

          beforeEach(inject(function(elementRegistry, modeling) {

            // given
            item = elementRegistry.get('DIS_Task_4');

            var humanTask = elementRegistry.get('PI_HumanTask_2');

            var target = elementRegistry.get('DIS_PlanFragment_1');
            planFragment = target.businessObject.definitionRef;

            // when
            modeling.moveElements([ item, humanTask ], { x: 0, y: 200 }, target);

          }));

          it('should execute', inject(function(elementRegistry) {
            // then
            expect(elementRegistry.get(item.id)).to.exist;

            expect(item.type).to.equal('cmmn:DiscretionaryItem');
            expect(planFragment.get('planItems')).not.to.include(item.businessObject);
          }));


          it('should undo', inject(function(commandStack, elementRegistry) {
            // when
            commandStack.undo();

            // then
            expect(elementRegistry.get(item.id)).to.exist;

            expect(item.type).to.equal('cmmn:DiscretionaryItem');
            expect(planFragment.get('planItems')).not.to.include(item.businessObject);
          }));


          it('should redo', inject(function(commandStack, elementRegistry) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(elementRegistry.get(item.id)).to.exist;

            expect(item.type).to.equal('cmmn:DiscretionaryItem');
            expect(planFragment.get('planItems')).not.to.include(item.businessObject);
          }));

        });


        describe('should NOT replace', function() {

          beforeEach(inject(function(elementRegistry, modeling) {

            // given
            item = elementRegistry.get('DIS_Task_5');

            var humanTask = elementRegistry.get('DIS_HumanTask_3');

            var target = elementRegistry.get('DIS_PlanFragment_1');
            planFragment = target.businessObject.definitionRef;

            // when
            modeling.moveElements([ item, humanTask ], { x: 0, y: 200 }, target);

          }));

          it('should execute', inject(function(elementRegistry) {
            // then
            expect(elementRegistry.get(item.id)).to.exist;

            expect(item.type).to.equal('cmmn:DiscretionaryItem');
            expect(planFragment.get('planItems')).not.to.include(item.businessObject);
          }));


          it('should undo', inject(function(commandStack, elementRegistry) {
            // when
            commandStack.undo();

            // then
            expect(elementRegistry.get(item.id)).to.exist;

            expect(item.type).to.equal('cmmn:DiscretionaryItem');
            expect(planFragment.get('planItems')).not.to.include(item.businessObject);
          }));


          it('should redo', inject(function(commandStack, elementRegistry) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(elementRegistry.get(item.id)).to.exist;

            expect(item.type).to.equal('cmmn:DiscretionaryItem');
            expect(planFragment.get('planItems')).not.to.include(item.businessObject);
          }));

        });

        describe('should replace', function() {

          var newItem;

          beforeEach(inject(function(elementRegistry, modeling) {

            // given
            item = elementRegistry.get('DIS_Task_4');

            var target = elementRegistry.get('DIS_PlanFragment_1');
            planFragment = target.businessObject.definitionRef;

            // when
            modeling.moveElements([ item ], { x: 0, y: 200 }, target);

            newItem = findItem(item.businessObject.definitionRef);

          }));

          it('should execute', inject(function(elementRegistry) {
            // then
            expect(elementRegistry.get(item.id)).not.to.exist;

            expect(newItem.type).to.equal('cmmn:PlanItem');
            expect(planFragment.get('planItems')).to.include(newItem.businessObject);
          }));


          it('should undo', inject(function(commandStack, elementRegistry) {
            // when
            commandStack.undo();

            // then
            expect(elementRegistry.get(item.id)).to.exist;

            expect(newItem.type).to.equal('cmmn:PlanItem');
            expect(planFragment.get('planItems')).not.to.include(newItem.businessObject);
          }));


          it('should redo', inject(function(commandStack, elementRegistry) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(elementRegistry.get(item.id)).not.to.exist;

            expect(newItem.type).to.equal('cmmn:PlanItem');
            expect(planFragment.get('planItems')).to.include(newItem.businessObject);
          }));

        });

        describe('should replace', function() {

          var newItem;

          beforeEach(inject(function(elementRegistry, modeling) {

            // given
            item = elementRegistry.get('DIS_HumanTask_3');
            var anotherItem = elementRegistry.get('DIS_Task_5');

            var target = elementRegistry.get('DIS_PlanFragment_1');
            planFragment = target.businessObject.definitionRef;

            // when
            modeling.moveElements([ item, anotherItem ], { x: 0, y: 200 }, target);

            newItem = findItem(item.businessObject.definitionRef);

          }));

          it('should execute', inject(function(elementRegistry) {
            // then
            expect(elementRegistry.get(item.id)).not.to.exist;

            expect(newItem.type).to.equal('cmmn:PlanItem');
            expect(planFragment.get('planItems')).to.include(newItem.businessObject);
          }));


          it('should undo', inject(function(commandStack, elementRegistry) {
            // when
            commandStack.undo();

            // then
            expect(elementRegistry.get(item.id)).to.exist;

            expect(newItem.type).to.equal('cmmn:PlanItem');
            expect(planFragment.get('planItems')).not.to.include(newItem.businessObject);
          }));


          it('should redo', inject(function(commandStack, elementRegistry) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(elementRegistry.get(item.id)).not.to.exist;

            expect(newItem.type).to.equal('cmmn:PlanItem');
            expect(planFragment.get('planItems')).to.include(newItem.businessObject);
          }));

        });

      });

    });

    describe('delete', function() {

      var findItem;

      beforeEach(inject(function(elementRegistry) {

        findItem = function(definition) {
          return elementRegistry.filter(function(element) {
            if(element.businessObject && element.businessObject.definitionRef === definition) {
              return true;
            }
          })[0];
        }

      }));

      describe('discretionary connection', function() {

        var item, newItem, planFragment;


        beforeEach(inject(function(elementRegistry, modeling) {

          // given
          var connection = elementRegistry.get('DiscretionaryConnection_1');

          item = elementRegistry.get('DIS_Task_2');
          planFragment = elementRegistry.get('DIS_PlanFragment_1').businessObject.definitionRef;

          // when
          modeling.removeElements([ connection ]);

          newItem = findItem(item.businessObject.definitionRef);

        }));

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(elementRegistry.get(item.id)).not.to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(newItem.businessObject);
        }));


        it('should undo', inject(function(commandStack, elementRegistry) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get(item.id)).to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).not.to.include(newItem.businessObject);
        }));


        it('should redo', inject(function(commandStack, elementRegistry) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(elementRegistry.get(item.id)).not.to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(newItem.businessObject);
        }));

      });


      describe('discretionary connection source', function() {

        var item, newItem, planFragment;


        beforeEach(inject(function(elementRegistry, modeling) {

          // given
          item = elementRegistry.get('DIS_Task_2');
          planFragment = elementRegistry.get('DIS_PlanFragment_1').businessObject.definitionRef;

          var shape = elementRegistry.get('PI_HumanTask_1');

          // when
          modeling.removeElements([ shape ]);

          newItem = findItem(item.businessObject.definitionRef);

        }));

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(elementRegistry.get(item.id)).not.to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(newItem.businessObject);
        }));


        it('should undo', inject(function(commandStack, elementRegistry) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get(item.id)).to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).not.to.include(newItem.businessObject);
        }));


        it('should redo', inject(function(commandStack, elementRegistry) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(elementRegistry.get(item.id)).not.to.exist;

          expect(newItem.type).to.equal('cmmn:PlanItem');
          expect(planFragment.get('planItems')).to.include(newItem.businessObject);
        }));

      });

    });

  });

});
