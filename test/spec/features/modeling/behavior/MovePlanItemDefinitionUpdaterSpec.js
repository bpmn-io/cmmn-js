'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #PlanItemDefinitionUpdater', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('move plan item definition', function() {

    var diagramXML = require('./PlanItemDefinitionUpdater.simple-move.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('to case plan model', function() {

      describe('when moving plan item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('PI_Task_1');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('CasePlanModel_1');
          target = targetShape.businessObject;

          // when
          modeling.moveShape(shape, { x: 400, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });


      describe('when moving discretionary item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('DIS_Task_2');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('CasePlanModel_1');
          target = targetShape.businessObject;

          // when
          modeling.moveShape(shape, { x: 400, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });

    });


    describe('to child stage', function() {

      describe('when moving plan item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('PI_Task_1');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_3');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 0, y: 250 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });


      describe('when moving discretionary item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('DIS_Task_2');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_3');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 0, y: 150 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });

    });


    describe('to parent stage', function() {

      describe('when moving plan item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('PI_Task_1');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_1');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 0, y: 450 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });


      describe('when moving discretionary item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('DIS_Task_2');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_1');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 0, y: 350 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });

    });


    describe('to another case plan model', function() {

      describe('when moving plan item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('PI_Task_1');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('CasePlanModel_2');
          target = targetShape.businessObject;

          // when
          modeling.moveShape(shape, { x: 600, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });


      describe('when moving discretionary item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('DIS_Task_2');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('CasePlanModel_2');
          target = targetShape.businessObject;

          // when
          modeling.moveShape(shape, { x: 600, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });

    });


    describe('to same stage', function() {

      describe('when moving plan item', function() {

        var target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('PI_Task_1');
          taskDefinition = shape.businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_2');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 20, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });


      describe('when moving discretionary item', function() {

        var target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('DIS_Task_2');
          taskDefinition = shape.businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_2');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 20, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });

    });

    describe('to sibling stage', function() {

      describe('when moving plan item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('PI_Task_1');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_4');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 225, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });


      describe('when moving discretionary item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('DIS_Task_2');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_4');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 225, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });

    });

  });


  describe('move shared plan item definition', function() {

    var diagramXML = require('./PlanItemDefinitionUpdater.move-shared-definition.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('to case plan model', function() {

      describe('when moving plan item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('PI_Task_1');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('CasePlanModel_1');
          target = targetShape.businessObject;

          // when
          modeling.moveShape(shape, { x: 400, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });


      describe('when moving discretionary item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('DIS_Task_2');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('CasePlanModel_1');
          target = targetShape.businessObject;

          // when
          modeling.moveShape(shape, { x: 400, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });

    });


    describe('should not move to child stage', function() {

      describe('when moving plan item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('PI_Task_1');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_3');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 0, y: 250 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));

      });


      describe('when moving discretionary item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('DIS_Task_2');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_3');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 0, y: 150 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));

      });

    });


    describe('to parent stage', function() {

      describe('when moving plan item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('PI_Task_1');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_1');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 0, y: 450 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });


      describe('when moving discretionary item', function() {

        var source, target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('DIS_Task_2');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_1');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 0, y: 350 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });

    });


    describe('to another case plan model', function() {

      describe('when moving plan item', function() {

        var source, target, taskPlanItem, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('PI_Task_1');
          taskPlanItem = shape.businessObject;
          taskDefinition = taskPlanItem.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('CasePlanModel_2');
          target = targetShape.businessObject;

          // when
          modeling.moveShape(shape, { x: 600, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(taskPlanItem.definitionRef).not.to.equal(taskDefinition);

          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskPlanItem.definitionRef);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
          expect(taskPlanItem.definitionRef.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(taskPlanItem.definitionRef).to.equal(taskDefinition);

          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskPlanItem.definitionRef);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
          expect(taskPlanItem.definitionRef.$parent).not.to.equal(target);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(taskPlanItem.definitionRef).not.to.equal(taskDefinition);

          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskPlanItem.definitionRef);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
          expect(taskPlanItem.definitionRef.$parent).to.equal(target);
        }));

      });


      describe('when moving discretionary item', function() {

        var source, target, taskDiscretionaryItem, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('DIS_Task_2');
          taskDiscretionaryItem = shape.businessObject;
          taskDefinition = taskDiscretionaryItem.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('CasePlanModel_2');
          target = targetShape.businessObject;

          // when
          modeling.moveShape(shape, { x: 600, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(taskDiscretionaryItem.definitionRef).not.to.equal(taskDefinition);

          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDiscretionaryItem.definitionRef);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
          expect(taskDiscretionaryItem.definitionRef.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(taskDiscretionaryItem.definitionRef).to.equal(taskDefinition);

          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDiscretionaryItem.definitionRef);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
          expect(taskDiscretionaryItem.definitionRef.$parent).not.to.equal(target);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(taskDiscretionaryItem.definitionRef).not.to.equal(taskDefinition);

          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).to.include(taskDiscretionaryItem.definitionRef);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
          expect(taskDiscretionaryItem.definitionRef.$parent).to.equal(target);
        }));

      });

    });


    describe('to same stage', function() {

      describe('when moving plan item', function() {

        var target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('PI_Task_1');
          taskDefinition = shape.businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_2');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 20, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });


      describe('when moving discretionary item', function() {

        var target, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('DIS_Task_2');
          taskDefinition = shape.businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_2');
          target = targetShape.businessObject.definitionRef;

          // when
          modeling.moveShape(shape, { x: 20, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(target.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(target);
        }));

      });

    });

    describe('to sibling stage', function() {

      describe('when moving plan item', function() {

        var source, target, casePlanModel, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('PI_Task_1');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_4');
          target = targetShape.businessObject.definitionRef;

          casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

          // when
          modeling.moveShape(shape, { x: 225, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(casePlanModel.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(casePlanModel);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(casePlanModel.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(casePlanModel.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(casePlanModel);
        }));

      });


      describe('when moving discretionary item', function() {

        var source, target, casePlanModel, taskDefinition;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var shape = elementRegistry.get('DIS_Task_2');
          taskDefinition = shape.businessObject.definitionRef;

          source = elementRegistry.get('PI_Stage_2').businessObject.definitionRef;

          var targetShape = elementRegistry.get('PI_Stage_4');
          target = targetShape.businessObject.definitionRef;

          casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

          // when
          modeling.moveShape(shape, { x: 225, y: 0 }, targetShape);
        }));


        it('should execute', function() {
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(casePlanModel.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(casePlanModel);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(source.get('planItemDefinitions')).to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(casePlanModel.get('planItemDefinitions')).not.to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(source);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(source.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(target.get('planItemDefinitions')).not.to.include(taskDefinition);
          expect(casePlanModel.get('planItemDefinitions')).to.include(taskDefinition);

          expect(taskDefinition.$parent).to.equal(casePlanModel);
        }));

      });

    });

  });

});
