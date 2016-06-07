'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling CmmnUpdater', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('update parent', function() {

    var testXML = require('./CmmnUpdater.cmmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));

    var rootElement;

    beforeEach(inject(function(canvas) {
      rootElement = canvas.getRootElement();
    }));

    describe('for task', function() {

      var task_PI;

      beforeEach(inject(function(elementFactory) {
        task_PI = elementFactory.createPlanItemShape('cmmn:Task');
      }));

      describe('set case plan', function() {

        var casePlan;

        beforeEach(inject(function(elementRegistry, modeling) {
          casePlan = elementRegistry.get('CasePlan_1');

          modeling.createShape(task_PI, { x: 150, y: 490 }, casePlan);
        }));

        it('should execute', function() {

          var casePlan_BO = casePlan.businessObject,
              task_PI_BO = task_PI.businessObject;

          // then
          // check parent PI
          expect(task_PI.parent).to.equal(casePlan);

          // check semantic parent
          expect(task_PI_BO.$parent).to.exist;
          expect(task_PI_BO.$parent).to.equal(casePlan_BO);

          // check parent containment
          expect(casePlan_BO.get('planItems')).to.include(task_PI_BO);
          expect(casePlan_BO.get('planItemDefinitions')).to.include(task_PI_BO.definitionRef);

          // check parent di
          expect(task_PI_BO.di.$parent).to.equal(rootElement.businessObject);

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).to.contain(task_PI_BO.di);
        });


        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          var casePlan_BO = casePlan.businessObject,
              task_PI_BO = task_PI.businessObject;

          // then
          // check parent PI
          expect(task_PI.parent).to.be.null;

          // check semantic parent
          expect(task_PI_BO.$parent).to.be.null;

          // check parent containment
          expect(casePlan_BO.get('planItems')).not.to.include(task_PI_BO);
          expect(casePlan_BO.get('planItemDefinitions')).not.to.include(task_PI_BO.definitionRef);

          // check parent di
          expect(task_PI_BO.di.$parent).to.be.null;

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).not.to.contain(task_PI_BO.di);
        }));


        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          var casePlan_BO = casePlan.businessObject,
              task_PI_BO = task_PI.businessObject;

          // then
          // check parent PI
          expect(task_PI.parent).to.equal(casePlan);

          // check semantic parent
          expect(task_PI_BO.$parent).to.exist;
          expect(task_PI_BO.$parent).to.equal(casePlan_BO);

          // check parent containment
          expect(casePlan_BO.get('planItems')).to.include(task_PI_BO);
          expect(casePlan_BO.get('planItemDefinitions')).to.include(task_PI_BO.definitionRef);

          // check parent di
          expect(task_PI_BO.di.$parent).to.equal(rootElement.businessObject);

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).to.contain(task_PI_BO.di);
        }));

      });


      describe('set stage', function() {

        var stage_PI;

        beforeEach(inject(function(elementRegistry, modeling) {
          stage_PI = elementRegistry.get('PI_Stage_1');

          modeling.createShape(task_PI, { x: 150, y: 405 }, stage_PI);
        }));

        it('should execute', function() {

          var stage_PI_BO = stage_PI.businessObject,
              task_PI_BO = task_PI.businessObject;

          // then
          // check parent PI
          expect(task_PI.parent).to.equal(stage_PI);

          // check semantic parent
          expect(task_PI_BO.$parent).to.exist;
          expect(task_PI_BO.$parent).to.equal(stage_PI_BO.definitionRef);

          // check parent containment
          expect(stage_PI_BO.definitionRef.get('planItems')).to.include(task_PI_BO);
          expect(stage_PI_BO.definitionRef.get('planItemDefinitions')).to.include(task_PI_BO.definitionRef);

          // check parent di
          expect(task_PI_BO.di.$parent).to.equal(rootElement.businessObject);

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).to.contain(task_PI_BO.di);

        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          var stage_PI_BO = stage_PI.businessObject,
              task_PI_BO = task_PI.businessObject;

          // then
          // check parent PI
          expect(task_PI.parent).to.be.null;

          // check semantic parent
          expect(task_PI_BO.$parent).to.be.null;

          // check parent containment
          expect(stage_PI_BO.definitionRef.get('planItems')).not.to.include(task_PI_BO);
          expect(stage_PI_BO.definitionRef.get('planItemDefinitions')).not.to.include(task_PI_BO.definitionRef);

          // check parent di
          expect(task_PI_BO.di.$parent).to.be.null;

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).not.to.contain(task_PI_BO.di);

        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          var stage_PI_BO = stage_PI.businessObject,
              task_PI_BO = task_PI.businessObject;

          // then
          // check parent PI
          expect(task_PI.parent).to.equal(stage_PI);

          // check semantic parent
          expect(task_PI_BO.$parent).to.exist;
          expect(task_PI_BO.$parent).to.equal(stage_PI_BO.definitionRef);

          // check parent containment
          expect(stage_PI_BO.definitionRef.get('planItems')).to.include(task_PI_BO);
          expect(stage_PI_BO.definitionRef.get('planItemDefinitions')).to.include(task_PI_BO.definitionRef);

          // check parent di
          expect(task_PI_BO.di.$parent).to.equal(rootElement.businessObject);

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).to.contain(task_PI_BO.di);

        }));

      });


      it('should set stage 1', inject(function(modeling, elementRegistry) {

        // given
        var stage_1_PI = elementRegistry.get('PI_Stage_1');

        // when
        modeling.createShape(task_PI, { x: 150, y: 405 }, stage_1_PI);

        var stage_1_PI_BO = stage_1_PI.businessObject,
            task_PI_BO = task_PI.businessObject;

        // then
        // check parent PI
        expect(task_PI.parent).to.equal(stage_1_PI);

        // check semantic parent
        expect(task_PI_BO.$parent).to.exist;
        expect(task_PI_BO.$parent).to.equal(stage_1_PI_BO.definitionRef);

        // check parent containment
        expect(stage_1_PI_BO.definitionRef.get('planItems')).to.include(task_PI_BO);
        expect(stage_1_PI_BO.definitionRef.get('planItemDefinitions')).to.include(task_PI_BO.definitionRef);

        // check parent di
        expect(task_PI_BO.di.$parent).to.equal(rootElement.businessObject);

        // check parent di containment
        expect(rootElement.businessObject.diagramElements).to.contain(task_PI_BO.di);
      }));


      it('should set stage 2', inject(function(modeling, elementRegistry) {

        var stage_2_PI = elementRegistry.get('PI_Stage_2');

        modeling.createShape(task_PI, { x: 150, y: 313 }, stage_2_PI);

        var stage_2_PI_BO = stage_2_PI.businessObject,
            task_PI_BO = task_PI.businessObject;

        // then
        // check parent PI
        expect(task_PI.parent).to.equal(stage_2_PI);

        // check semantic parent
        expect(task_PI_BO.$parent).to.exist;
        expect(task_PI_BO.$parent).to.equal(stage_2_PI_BO.definitionRef);

        // check parent containment
        expect(stage_2_PI_BO.definitionRef.get('planItems')).to.include(task_PI_BO);
        expect(stage_2_PI_BO.definitionRef.get('planItemDefinitions')).to.include(task_PI_BO.definitionRef);

        // check parent di
        expect(task_PI_BO.di.$parent).to.equal(rootElement.businessObject);

        // check parent di containment
        expect(rootElement.businessObject.diagramElements).to.contain(task_PI_BO.di);

      }));


      it('should set stage 3', inject(function(modeling, elementRegistry) {

        var stage_3_PI = elementRegistry.get('PI_Stage_3');

        modeling.createShape(task_PI, { x: 150, y: 200 }, stage_3_PI);

        var stage_3_PI_BO = stage_3_PI.businessObject,
            task_PI_BO = task_PI.businessObject;

        // then
        // check parent PI
        expect(task_PI.parent).to.equal(stage_3_PI);

        // check semantic parent
        expect(task_PI_BO.$parent).to.exist;
        expect(task_PI_BO.$parent).to.equal(stage_3_PI_BO.definitionRef);

        // check parent containment
        expect(stage_3_PI_BO.definitionRef.get('planItems')).to.include(task_PI_BO);
        expect(stage_3_PI_BO.definitionRef.get('planItemDefinitions')).to.include(task_PI_BO.definitionRef);

        // check parent di
        expect(task_PI_BO.di.$parent).to.equal(rootElement.businessObject);

        // check parent di containment
        expect(rootElement.businessObject.diagramElements).to.contain(task_PI_BO.di);

      }));

    });


    describe('for expanded stage', function() {

      var stage_PI;

      beforeEach(inject(function(elementFactory) {
        stage_PI = elementFactory.createPlanItemShape('cmmn:Stage');
      }));


      describe('set casePlan', function() {

        var casePlan;

        beforeEach(inject(function(modeling, elementRegistry) {
          casePlan = elementRegistry.get('CasePlan_1');

          modeling.createShape(stage_PI, { x: 150, y: 490 }, casePlan);
        }));

        it('should execute', function() {

          var casePlan_BO = casePlan.businessObject,
              stage_PI_BO = stage_PI.businessObject;

          // then
          // check parent PI
          expect(stage_PI.parent).to.equal(casePlan);

          // check semantic parent
          expect(stage_PI_BO.$parent).to.exist;
          expect(stage_PI_BO.$parent).to.equal(casePlan_BO);

          // check parent containment
          expect(casePlan_BO.get('planItems')).to.include(stage_PI_BO);
          expect(casePlan_BO.get('planItemDefinitions')).to.include(stage_PI_BO.definitionRef);

          // check parent di
          expect(stage_PI_BO.di.$parent).to.equal(rootElement.businessObject);

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).to.contain(stage_PI_BO.di);
        });


        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          var casePlan_BO = casePlan.businessObject,
              stage_PI_BO = stage_PI.businessObject;

          // then
          // check parent PI
          expect(stage_PI.parent).to.be.null;

          // check semantic parent
          expect(stage_PI_BO.$parent).to.be.null;

          // check parent containment
          expect(casePlan_BO.get('planItems')).not.to.include(stage_PI_BO);
          expect(casePlan_BO.get('planItemDefinitions')).not.to.include(stage_PI_BO.definitionRef);

          // check parent di
          expect(stage_PI_BO.di.$parent).to.be.null;

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).not.to.contain(stage_PI_BO.di);
        }));


        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          var casePlan_BO = casePlan.businessObject,
              stage_PI_BO = stage_PI.businessObject;

          // then
          // check parent PI
          expect(stage_PI.parent).to.equal(casePlan);

          // check semantic parent
          expect(stage_PI_BO.$parent).to.exist;
          expect(stage_PI_BO.$parent).to.equal(casePlan_BO);

          // check parent containment
          expect(casePlan_BO.get('planItems')).to.include(stage_PI_BO);
          expect(casePlan_BO.get('planItemDefinitions')).to.include(stage_PI_BO.definitionRef);

          // check parent di
          expect(stage_PI_BO.di.$parent).to.equal(rootElement.businessObject);

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).to.contain(stage_PI_BO.di);
        }));

      });


      describe('set stage', function() {

        var stage_1_PI;

        beforeEach(inject(function(modeling, elementRegistry) {
          stage_1_PI = elementRegistry.get('PI_Stage_1');

          modeling.createShape(stage_PI, { x: 150, y: 405 }, stage_1_PI);
        }));

        it('should execute', function() {


          var stage_1_PI_BO = stage_1_PI.businessObject,
              stage_PI_BO = stage_PI.businessObject;

          // then
          // check parent PI
          expect(stage_PI.parent).to.equal(stage_1_PI);

          // check semantic parent
          expect(stage_PI_BO.$parent).to.exist;
          expect(stage_PI_BO.$parent).to.equal(stage_1_PI_BO.definitionRef);

          // check parent containment
          expect(stage_1_PI_BO.definitionRef.get('planItems')).to.include(stage_PI_BO);
          expect(stage_1_PI_BO.definitionRef.get('planItemDefinitions')).to.include(stage_PI_BO.definitionRef);

          // check parent di
          expect(stage_PI_BO.di.$parent).to.equal(rootElement.businessObject);

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).to.contain(stage_PI_BO.di);
        });


        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          var stage_1_PI_BO = stage_1_PI.businessObject,
              stage_PI_BO = stage_PI.businessObject;

          // then
          // check parent PI
          expect(stage_PI.parent).to.be.null;

          // check semantic parent
          expect(stage_PI_BO.$parent).to.be.null;

          // check parent containment
          expect(stage_1_PI_BO.definitionRef.get('planItems')).not.to.include(stage_PI_BO);
          expect(stage_1_PI_BO.definitionRef.get('planItemDefinitions')).not.to.include(stage_PI_BO.definitionRef);

          // check parent di
          expect(stage_PI_BO.di.$parent).to.be.null;

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).not.to.contain(stage_PI_BO.di);
        }));


        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          var stage_1_PI_BO = stage_1_PI.businessObject,
              stage_PI_BO = stage_PI.businessObject;

          // then
          // check parent PI
          expect(stage_PI.parent).to.equal(stage_1_PI);

          // check semantic parent
          expect(stage_PI_BO.$parent).to.exist;
          expect(stage_PI_BO.$parent).to.equal(stage_1_PI_BO.definitionRef);

          // check parent containment
          expect(stage_1_PI_BO.definitionRef.get('planItems')).to.include(stage_PI_BO);
          expect(stage_1_PI_BO.definitionRef.get('planItemDefinitions')).to.include(stage_PI_BO.definitionRef);

          // check parent di
          expect(stage_PI_BO.di.$parent).to.equal(rootElement.businessObject);

        }));

      });

    });

    describe('for case plan model', function() {

      var casePlanModelShape, _case, defintions, rootElement;

      beforeEach(inject(function(elementFactory) {
        casePlanModelShape = elementFactory.createCasePlanModelShape();
        _case = casePlanModelShape.businessObject.$parent;
      }));

      beforeEach(inject(function(elementRegistry) {
        var casePlan = elementRegistry.get('CasePlan_1');
        defintions = casePlan.businessObject.$parent.$parent;
      }));

      beforeEach(inject(function(canvas) {
        rootElement = canvas.getRootElement();
      }));

      describe('set defintions', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          modeling.createShape(casePlanModelShape, { x: 875, y: 150 }, rootElement);
        }));

        it('should execute', function() {

          var casePlanModelShape_BO = casePlanModelShape.businessObject;

          // then
          // check parent PI
          expect(casePlanModelShape.parent).to.equal(rootElement);

          // check semantic parent of case element
          expect(_case.$parent).to.exist;
          expect(_case.$parent).to.equal(defintions);

          // check parent containment of case element
          expect(defintions.get('cases')).to.include(_case);

          // check parent di
          expect(casePlanModelShape_BO.di.$parent).to.equal(rootElement.businessObject);

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).to.contain(casePlanModelShape_BO.di);
        });


        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          var casePlanModelShape_BO = casePlanModelShape.businessObject;

          // then
          // check parent PI
          expect(casePlanModelShape.parent).to.be.null;

          // check semantic parent
          expect(_case.$parent).to.be.null;

          // check parent containment
          expect(defintions.get('cases')).not.to.include(_case);

          // check parent di
          expect(casePlanModelShape_BO.di.$parent).to.be.null;

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).not.to.contain(casePlanModelShape_BO.di);
        }));


        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          var casePlanModelShape_BO = casePlanModelShape.businessObject;

          // then
          // check parent PI
          expect(casePlanModelShape.parent).to.equal(rootElement);

          // check semantic parent of case element
          expect(_case.$parent).to.exist;
          expect(_case.$parent).to.equal(defintions);

          // check parent containment
          expect(defintions.get('cases')).to.include(_case);

          // check parent di
          expect(casePlanModelShape_BO.di.$parent).to.equal(rootElement.businessObject);

          // check parent di containment
          expect(rootElement.businessObject.diagramElements).to.contain(casePlanModelShape_BO.di);
        }));

      });

    });


    describe('for milestone', function() {

      var milestone_PI;

      beforeEach(inject(function(elementFactory) {
        milestone_PI = elementFactory.createPlanItemShape('cmmn:Milestone');
      }));

      describe('set case plan', function() {

        var casePlan;

        beforeEach(inject(function(elementRegistry, modeling) {
          casePlan = elementRegistry.get('CasePlan_1');

          modeling.createShape(milestone_PI, { x: 150, y: 490 }, casePlan);
        }));

        it('should execute', function() {

          var casePlan_BO = casePlan.businessObject,
              milestone_PI_BO = milestone_PI.businessObject;

          // then
          // check parent PI
          expect(milestone_PI.parent).to.equal(casePlan);

          // check semantic parent
          expect(milestone_PI_BO.$parent).to.exist;
          expect(milestone_PI_BO.$parent).to.equal(casePlan_BO);

          // check parent containment
          expect(casePlan_BO.get('planItems')).to.include(milestone_PI_BO);
          expect(casePlan_BO.get('planItemDefinitions')).to.include(milestone_PI_BO.definitionRef);
        });


        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          var casePlan_BO = casePlan.businessObject,
              milestone_PI_BO = milestone_PI.businessObject;

          // then
          // check parent PI
          expect(milestone_PI.parent).to.be.null;

          // check semantic parent
          expect(milestone_PI_BO.$parent).to.be.null;

          // check parent containment
          expect(casePlan_BO.get('planItems')).not.to.include(milestone_PI_BO);
          expect(casePlan_BO.get('planItemDefinitions')).not.to.include(milestone_PI_BO.definitionRef);
        }));


        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          var casePlan_BO = casePlan.businessObject,
              milestone_PI_BO = milestone_PI.businessObject;

          // then
          // check parent PI
          expect(milestone_PI.parent).to.equal(casePlan);

          // check semantic parent
          expect(milestone_PI_BO.$parent).to.exist;
          expect(milestone_PI_BO.$parent).to.equal(casePlan_BO);

          // check parent containment
          expect(casePlan_BO.get('planItems')).to.include(milestone_PI_BO);
          expect(casePlan_BO.get('planItemDefinitions')).to.include(milestone_PI_BO.definitionRef);
        }));

      });


      describe('set stage', function() {

        var stage_PI;

        beforeEach(inject(function(elementRegistry, modeling) {
          stage_PI = elementRegistry.get('PI_Stage_1');

          modeling.createShape(milestone_PI, { x: 150, y: 405 }, stage_PI);
        }));

        it('should execute', function() {

          var stage_PI_BO = stage_PI.businessObject,
              milestone_PI_BO = milestone_PI.businessObject;

          // then
          // check parent PI
          expect(milestone_PI.parent).to.equal(stage_PI);

          // check semantic parent
          expect(milestone_PI_BO.$parent).to.exist;
          expect(milestone_PI_BO.$parent).to.equal(stage_PI_BO.definitionRef);

          // check parent containment
          expect(stage_PI_BO.definitionRef.get('planItems')).to.include(milestone_PI_BO);
          expect(stage_PI_BO.definitionRef.get('planItemDefinitions')).to.include(milestone_PI_BO.definitionRef);

        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          var stage_PI_BO = stage_PI.businessObject,
              milestone_PI_BO = milestone_PI.businessObject;

          // then
          // check parent PI
          expect(milestone_PI.parent).to.be.null;

          // check semantic parent
          expect(milestone_PI_BO.$parent).to.be.null;

          // check parent containment
          expect(stage_PI_BO.definitionRef.get('planItems')).not.to.include(milestone_PI_BO);
          expect(stage_PI_BO.definitionRef.get('planItemDefinitions')).not.to.include(milestone_PI_BO.definitionRef);

        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          var stage_PI_BO = stage_PI.businessObject,
              milestone_PI_BO = milestone_PI.businessObject;

          // then
          // check parent PI
          expect(milestone_PI.parent).to.equal(stage_PI);

          // check semantic parent
          expect(milestone_PI_BO.$parent).to.exist;
          expect(milestone_PI_BO.$parent).to.equal(stage_PI_BO.definitionRef);

          // check parent containment
          expect(stage_PI_BO.definitionRef.get('planItems')).to.include(milestone_PI_BO);
          expect(stage_PI_BO.definitionRef.get('planItemDefinitions')).to.include(milestone_PI_BO.definitionRef);

        }));

      });


      it('should set stage 1', inject(function(modeling, elementRegistry) {

        // given
        var stage_1_PI = elementRegistry.get('PI_Stage_1');

        // when
        modeling.createShape(milestone_PI, { x: 150, y: 405 }, stage_1_PI);

        var stage_1_PI_BO = stage_1_PI.businessObject,
            milestone_PI_BO = milestone_PI.businessObject;

        // then
        // check parent PI
        expect(milestone_PI.parent).to.equal(stage_1_PI);

        // check semantic parent
        expect(milestone_PI_BO.$parent).to.exist;
        expect(milestone_PI_BO.$parent).to.equal(stage_1_PI_BO.definitionRef);

        // check parent containment
        expect(stage_1_PI_BO.definitionRef.get('planItems')).to.include(milestone_PI_BO);
        expect(stage_1_PI_BO.definitionRef.get('planItemDefinitions')).to.include(milestone_PI_BO.definitionRef);

      }));


      it('should set stage 2', inject(function(modeling, elementRegistry) {

        var stage_2_PI = elementRegistry.get('PI_Stage_2');

        modeling.createShape(milestone_PI, { x: 150, y: 313 }, stage_2_PI);

        var stage_2_PI_BO = stage_2_PI.businessObject,
            milestone_PI_BO = milestone_PI.businessObject;

        // then
        // check parent PI
        expect(milestone_PI.parent).to.equal(stage_2_PI);

        // check semantic parent
        expect(milestone_PI_BO.$parent).to.exist;
        expect(milestone_PI_BO.$parent).to.equal(stage_2_PI_BO.definitionRef);

        // check parent containment
        expect(stage_2_PI_BO.definitionRef.get('planItems')).to.include(milestone_PI_BO);
        expect(stage_2_PI_BO.definitionRef.get('planItemDefinitions')).to.include(milestone_PI_BO.definitionRef);

      }));


      it('should set stage 3', inject(function(modeling, elementRegistry) {

        var stage_3_PI = elementRegistry.get('PI_Stage_3');

        modeling.createShape(milestone_PI, { x: 150, y: 200 }, stage_3_PI);

        var stage_3_PI_BO = stage_3_PI.businessObject,
            milestone_PI_BO = milestone_PI.businessObject;

        // then
        // check parent PI
        expect(milestone_PI.parent).to.equal(stage_3_PI);

        // check semantic parent
        expect(milestone_PI_BO.$parent).to.exist;
        expect(milestone_PI_BO.$parent).to.equal(stage_3_PI_BO.definitionRef);

        // check parent containment
        expect(stage_3_PI_BO.definitionRef.get('planItems')).to.include(milestone_PI_BO);
        expect(stage_3_PI_BO.definitionRef.get('planItemDefinitions')).to.include(milestone_PI_BO.definitionRef);

      }));

    });

    describe('for text annotation', function() {

      var textAnnotation, rootElement, definitions;

      beforeEach(inject(function(elementFactory) {
        textAnnotation = elementFactory.create('shape', { type: 'cmmn:TextAnnotation' });
      }));

      describe('drop on root element', function() {

        beforeEach(inject(function(modeling, canvas, elementRegistry) {

          // given
          rootElement = canvas.getRootElement();
          definitions = elementRegistry.get('CasePlan_1').businessObject.$parent.$parent;

          // when
          modeling.createShape(textAnnotation, { x: 750, y: 200 }, rootElement);

        }));

        it('should execute', function() {
          // then
          // check parent PI
          expect(textAnnotation.parent).to.equal(rootElement);

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).to.exist;
          expect(textAnnotation.businessObject.$parent).to.equal(definitions);

          // check parent containment
          expect(definitions.artifacts).to.include(textAnnotation.businessObject);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          // check parent PI
          expect(textAnnotation.parent).not.to.exist;

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).not.to.exist;

          // check parent containment
          expect(definitions.get('artifacts')).not.to.include(textAnnotation.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          // check parent PI
          expect(textAnnotation.parent).to.equal(rootElement);

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).to.exist;
          expect(textAnnotation.businessObject.$parent).to.equal(definitions);

          // check parent containment
          expect(definitions.artifacts).to.include(textAnnotation.businessObject);
        }));

      });


      describe('drop on stage', function() {

        var stage;

        beforeEach(inject(function(modeling, canvas, elementRegistry) {

          // given
          rootElement = canvas.getRootElement();
          stage = elementRegistry.get('PI_Stage_3');
          definitions = elementRegistry.get('CasePlan_1').businessObject.$parent.$parent;

          // when
          modeling.createShape(textAnnotation, { x: 200, y: 200 }, stage);

        }));

        it('should execute', function() {
          // then
          // check parent PI
          expect(textAnnotation.parent).to.equal(stage);

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).to.exist;
          expect(textAnnotation.businessObject.$parent).to.equal(definitions);

          // check parent containment
          expect(definitions.artifacts).to.include(textAnnotation.businessObject);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          // check parent PI
          expect(textAnnotation.parent).not.to.exist;

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).not.to.exist;

          // check parent containment
          expect(definitions.get('artifacts')).not.to.include(textAnnotation.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          // check parent PI
          expect(textAnnotation.parent).to.equal(stage);

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).to.exist;
          expect(textAnnotation.businessObject.$parent).to.equal(definitions);

          // check parent containment
          expect(definitions.artifacts).to.include(textAnnotation.businessObject);
        }));

      });


      describe('move to root element', function() {

        beforeEach(inject(function(modeling, canvas, elementRegistry) {

          // given
          rootElement = canvas.getRootElement();
          definitions = elementRegistry.get('CasePlan_1').businessObject.$parent.$parent;

          textAnnotation = elementRegistry.get('TextAnnotation_1');

          // when
          modeling.moveElements([ textAnnotation ], { x: 350, y: 0 }, rootElement);

        }));

        it('should execute', function() {
          // then
          // check parent PI
          expect(textAnnotation.parent).to.equal(rootElement);

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).to.exist;
          expect(textAnnotation.businessObject.$parent).to.equal(definitions);

          // check parent containment
          expect(definitions.artifacts).to.include(textAnnotation.businessObject);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          // check parent PI
          expect(textAnnotation.parent).to.exist;

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).to.exist;
          expect(textAnnotation.businessObject.$parent).to.equal(definitions);

          // check parent containment
          expect(definitions.artifacts).to.include(textAnnotation.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          // check parent PI
          expect(textAnnotation.parent).to.equal(rootElement);

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).to.exist;
          expect(textAnnotation.businessObject.$parent).to.equal(definitions);

          // check parent containment
          expect(definitions.artifacts).to.include(textAnnotation.businessObject);
        }));

      });


      describe('move to stage', function() {

        var stage;

        beforeEach(inject(function(modeling, canvas, elementRegistry) {

          // given
          rootElement = canvas.getRootElement();
          stage = elementRegistry.get('PI_Stage_3');
          definitions = elementRegistry.get('CasePlan_1').businessObject.$parent.$parent;

          textAnnotation = elementRegistry.get('TextAnnotation_1');

          // when
          modeling.moveElements([ textAnnotation ], { x: 0, y: -100 }, stage);

        }));

        it('should execute', function() {
          // then
          // check parent PI
          expect(textAnnotation.parent).to.equal(stage);

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).to.exist;
          expect(textAnnotation.businessObject.$parent).to.equal(definitions);

          // check parent containment
          expect(definitions.artifacts).to.include(textAnnotation.businessObject);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          // check parent PI
          expect(textAnnotation.parent).to.exist;

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).to.exist;
          expect(textAnnotation.businessObject.$parent).to.equal(definitions);

          // check parent containment
          expect(definitions.artifacts).to.include(textAnnotation.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          // check parent PI
          expect(textAnnotation.parent).to.equal(stage);

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).to.exist;
          expect(textAnnotation.businessObject.$parent).to.equal(definitions);

          // check parent containment
          expect(definitions.artifacts).to.include(textAnnotation.businessObject);
        }));

      });


      describe('delete', function() {

        beforeEach(inject(function(modeling, canvas, elementRegistry) {

          // given
          textAnnotation = elementRegistry.get('TextAnnotation_1');
          rootElement = canvas.getRootElement();
          definitions = elementRegistry.get('Diagram_1').businessObject.$parent.$parent;

          // when
          modeling.removeShape(textAnnotation);

        }));

        it('should execute', function() {
          // then
          // check parent PI
          expect(textAnnotation.parent).not.to.exist;

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).not.to.exist;
          expect(textAnnotation.businessObject.$parent).not.to.exist;

          // check parent containment
          expect(definitions.artifacts).not.to.include(textAnnotation.businessObject);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          // check semantic parent
          expect(textAnnotation.businessObject.$parent).to.exist;
          expect(textAnnotation.businessObject.$parent).to.equal(definitions);

          // check parent containment
          expect(definitions.artifacts).to.include(textAnnotation.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          // check parent PI
          expect(textAnnotation.parent).not.to.exist;

          // check semantic parent
          expect(textAnnotation.businessObject.$parent).not.to.exist;
          expect(textAnnotation.businessObject.$parent).not.to.exist;

          // check parent containment
          expect(definitions.artifacts).not.to.include(textAnnotation.businessObject);
        }));

      });

    });

  });

  describe('update discretionary connection', function() {

    var testXML = require('./CmmnUpdater.discretionary-connection.cmmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));

    var rootElement;

    beforeEach(inject(function(canvas) {
      rootElement = canvas.getRootElement();
    }));

    var connection, connectionBO;

    beforeEach(inject(function(elementRegistry) {
      // given
      connection = elementRegistry.get('DiscretionaryConnection_1');
      connectionBO = connection.businessObject;
    }));

    describe('delete', function() {

      beforeEach(inject(function(modeling) {
        // when
        modeling.removeConnection(connection);
      }));


      it('should execute', function() {
        // then
        expect(connectionBO.sourceCMMNElementRef).not.to.exist;
        expect(connectionBO.targetCMMNElementRef).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.include(connectionBO);
        expect(connectionBO.$parent).not.to.exist;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(connectionBO.sourceCMMNElementRef).to.exist;
        expect(connectionBO.targetCMMNElementRef).to.exist;
        expect(rootElement.businessObject.diagramElements).to.include(connectionBO);
        expect(connectionBO.$parent).to.equal(rootElement.businessObject);
      }));


      it('should execute', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connectionBO.sourceCMMNElementRef).not.to.exist;
        expect(connectionBO.targetCMMNElementRef).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.include(connectionBO);
        expect(connectionBO.$parent).not.to.exist;
      }));

    });


    describe('create', function() {

      var source, target;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var sourceShape = elementRegistry.get('PI_Task_4');
        source = sourceShape.businessObject;

        var targetShape = elementRegistry.get('DIS_Task_3');
        target = targetShape.businessObject;

        // when
        connection = modeling.connect(sourceShape, targetShape, { type: 'cmmndi:CMMNEdge' });
        connectionBO = connection.businessObject;
      }));


      it('should execute', function() {
        // then
        expect(connectionBO.sourceCMMNElementRef).to.equal(source);
        expect(connectionBO.targetCMMNElementRef).to.equal(target);
        expect(rootElement.businessObject.diagramElements).to.include(connectionBO);
        expect(connectionBO.$parent).to.equal(rootElement.businessObject);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(connectionBO.sourceCMMNElementRef).not.to.exist;
        expect(connectionBO.targetCMMNElementRef).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.include(connectionBO);
        expect(connectionBO.$parent).not.to.exist;
      }));


      it('should execute', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connectionBO.sourceCMMNElementRef).to.equal(source);
        expect(connectionBO.targetCMMNElementRef).to.equal(target);
        expect(rootElement.businessObject.diagramElements).to.include(connectionBO);
        expect(connectionBO.$parent).to.equal(rootElement.businessObject);
      }));

    });


    describe('reconnectStart', function() {

      var newSource, oldSource, target;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        connection = elementRegistry.get('DiscretionaryConnection_1');
        connectionBO = connection.businessObject;

        oldSource = connection.source.businessObject;
        target = connection.target.businessObject;

        var sourceShape = elementRegistry.get('PI_Task_4');
        newSource = sourceShape.businessObject;

        var newWaypoints = [{
          x: sourceShape.x + 100,
          y: sourceShape.y + 40
        }, connection.waypoints[1]];

        // when
        modeling.reconnectStart(connection, sourceShape, newWaypoints);
      }));


      it('should execute', function() {
        // then
        expect(connectionBO.sourceCMMNElementRef).to.equal(newSource);
        expect(connectionBO.targetCMMNElementRef).to.equal(target);
        expect(rootElement.businessObject.diagramElements).to.include(connectionBO);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(connectionBO.sourceCMMNElementRef).to.equal(oldSource);
        expect(connectionBO.targetCMMNElementRef).to.equal(target);
        expect(rootElement.businessObject.diagramElements).to.include(connectionBO);
      }));


      it('should execute', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connectionBO.sourceCMMNElementRef).to.equal(newSource);
        expect(connectionBO.targetCMMNElementRef).to.equal(target);
        expect(rootElement.businessObject.diagramElements).to.include(connectionBO);
      }));

    });


    describe('reconnectEnd', function() {

      var source, newTarget, oldTarget;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        connection = elementRegistry.get('DiscretionaryConnection_1');
        connectionBO = connection.businessObject;

        source = connection.source.businessObject;
        oldTarget = connection.target.businessObject;

        var targetShape = elementRegistry.get('DIS_Task_3');
        newTarget = targetShape.businessObject;

        var newWaypoints = [
          connection.waypoints[0],
          {
            x: targetShape.x,
            y: targetShape.y + 40
          }
        ];

        // when
        modeling.reconnectEnd(connection, targetShape, newWaypoints);
      }));


      it('should execute', function() {
        // then
        expect(connectionBO.sourceCMMNElementRef).to.equal(source);
        expect(connectionBO.targetCMMNElementRef).to.equal(newTarget);
        expect(rootElement.businessObject.diagramElements).to.include(connectionBO);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(connectionBO.sourceCMMNElementRef).to.equal(source);
        expect(connectionBO.targetCMMNElementRef).to.equal(oldTarget);
        expect(rootElement.businessObject.diagramElements).to.include(connectionBO);
      }));


      it('should execute', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connectionBO.sourceCMMNElementRef).to.equal(source);
        expect(connectionBO.targetCMMNElementRef).to.equal(newTarget);
        expect(rootElement.businessObject.diagramElements).to.include(connectionBO);
      }));

    });

  });

  describe('update association', function() {

    var testXML = require('./CmmnUpdater.association.cmmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));

    var rootElement, connection, connectionBO, definitions, source, target;

    beforeEach(inject(function(canvas) {
      rootElement = canvas.getRootElement();
      definitions = rootElement.businessObject.$parent.$parent;
    }));


    describe('delete', function() {

      beforeEach(inject(function(elementRegistry) {
        // given
        connection = elementRegistry.get('Association_1_di');
        connectionBO = connection.businessObject.cmmnElementRef;

        source = connectionBO.sourceRef;
        target = connectionBO.targetRef;

      }));

      beforeEach(inject(function(modeling) {
        // when
        modeling.removeConnection(connection);
      }));


      it('should execute', function() {
        // then
        expect(definitions.artifacts).not.to.include(connectionBO);

        expect(connectionBO.sourceRef).not.to.exist;
        expect(connectionBO.targetRef).not.to.exist;

        expect(connectionBO.$parent).not.to.exist;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(definitions.artifacts).to.include(connectionBO);

        expect(connectionBO.sourceRef).to.equal(source);
        expect(connectionBO.targetRef).to.equal(target);

        expect(connectionBO.$parent).to.equal(definitions);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(definitions.artifacts).not.to.include(connectionBO);

        expect(connectionBO.sourceRef).not.to.exist;
        expect(connectionBO.targetRef).not.to.exist;

        expect(connectionBO.$parent).not.to.exist;
      }));

    });


    describe('create', function() {

      var source, target;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var sourceShape = elementRegistry.get('PI_Task_2');
        source = sourceShape.businessObject;

        var targetShape = elementRegistry.get('TextAnnotation_2');
        target = targetShape.businessObject;

        // when
        connection = modeling.connect(sourceShape, targetShape, { type: 'cmmn:Association' });
        connectionBO = connection.businessObject.cmmnElementRef;
      }));


      it('should execute', function() {
        // then
        expect(definitions.artifacts).to.include(connectionBO);

        expect(connectionBO.sourceRef).to.equal(source);
        expect(connectionBO.targetRef).to.equal(target);

        expect(connectionBO.$parent).to.equal(definitions);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(definitions.artifacts).not.to.include(connectionBO);

        expect(connectionBO.sourceRef).not.to.exist;
        expect(connectionBO.targetRef).not.to.exist;

        expect(connectionBO.$parent).not.to.exist;
      }));


      it('should execute', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(definitions.artifacts).to.include(connectionBO);

        expect(connectionBO.sourceRef).to.equal(source);
        expect(connectionBO.targetRef).to.equal(target);

        expect(connectionBO.$parent).to.equal(definitions);
      }));

    });


    describe('reconnectStart', function() {

      var newSource;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        connection = elementRegistry.get('Association_1_di');
        connectionBO = connection.businessObject.cmmnElementRef;

        source = connection.source.businessObject;
        target = connection.target.businessObject;

        var sourceShape = elementRegistry.get('PI_Task_2');
        newSource = sourceShape.businessObject;

        var newWaypoints = [{
          x: sourceShape.x + 100,
          y: sourceShape.y + 40
        }, connection.waypoints[1]];

        // when
        modeling.reconnectStart(connection, sourceShape, newWaypoints);
      }));


      it('should execute', function() {
        // then
        expect(connectionBO.sourceRef).to.equal(newSource);
        expect(connectionBO.targetRef).to.equal(target);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(connectionBO.sourceRef).to.equal(source);
        expect(connectionBO.targetRef).to.equal(target);
      }));


      it('should execute', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connectionBO.sourceRef).to.equal(newSource);
        expect(connectionBO.targetRef).to.equal(target);
      }));

    });


    describe('reconnectEnd', function() {

      var newTarget;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        connection = elementRegistry.get('Association_1_di');
        connectionBO = connection.businessObject.cmmnElementRef;

        source = connection.source.businessObject;
        target = connection.target.businessObject;

        var targetShape = elementRegistry.get('TextAnnotation_2');
        newTarget = targetShape.businessObject;

        var newWaypoints = [
          connection.waypoints[0],
          {
            x: targetShape.x,
            y: targetShape.y + 40
          }
        ];

        // when
        modeling.reconnectEnd(connection, targetShape, newWaypoints);
      }));


      it('should execute', function() {
        // then
        expect(connectionBO.sourceRef).to.equal(source);
        expect(connectionBO.targetRef).to.equal(newTarget);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(connectionBO.sourceRef).to.equal(source);
        expect(connectionBO.targetRef).to.equal(target);
      }));


      it('should execute', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connectionBO.sourceRef).to.equal(source);
        expect(connectionBO.targetRef).to.equal(newTarget);
      }));

    });

  });


  describe('update plan item file item on part', function() {

    var testXML = require('./CmmnUpdater.plan-item-on-part.cmmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));

    var rootElement;

    beforeEach(inject(function(canvas) {
      rootElement = canvas.getRootElement();
    }));

    var connection, onPart, source, target;

    describe('delete', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var connectionShape = elementRegistry.get('PlanItemOnPart_1_di');

        source = connectionShape.source.businessObject;
        target = connectionShape.target.businessObject;

        connection = connectionShape.businessObject;

        onPart = connection.cmmnElementRef;

        // when
        modeling.removeConnection(connectionShape);

      }));


      it('should execute', function() {
        // then
        expect(onPart.sourceRef).not.to.exist;
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).not.to.exist;

        expect(connection.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.include(connection);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(onPart.sourceRef).not.to.exist;
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).not.to.exist;

        expect(connection.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.include(connection);
      }));

    });


    describe('create', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var sourceShape = elementRegistry.get('PI_Task_3');
        var targetShape = elementRegistry.get('ExitCriterion_2');

        source = sourceShape.businessObject;
        target = targetShape.businessObject;

        // when
        var connectionShape = modeling.connect(sourceShape, targetShape, { type: 'cmmn:PlanItemOnPart' });

        connection = connectionShape.businessObject;
        onPart = connection.cmmnElementRef;

      }));


      it('should execute', function() {
        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.sourceRef).not.to.exist;
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).not.to.exist;

        expect(connection.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.include(connection);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));

    });


    describe('create set exit criterion as source', function() {

      var host;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var sourceShape = elementRegistry.get('ExitCriterion_6');
        var targetShape = elementRegistry.get('ExitCriterion_2');

        source = sourceShape.businessObject;
        target = targetShape.businessObject;

        host = sourceShape.host.businessObject;

        // when
        var connectionShape = modeling.connect(sourceShape, targetShape, { type: 'cmmn:PlanItemOnPart' });

        connection = connectionShape.businessObject;
        onPart = connection.cmmnElementRef;

      }));


      it('should execute', function() {
        // then
        expect(onPart.sourceRef).to.equal(host);
        expect(onPart.exitCriterionRef).to.equal(source);
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.sourceRef).not.to.exist;
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).not.to.exist;

        expect(connection.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.include(connection);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(onPart.sourceRef).to.equal(host);
        expect(onPart.exitCriterionRef).to.equal(source);
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));

    });


    describe('reconnectStart', function() {

      var newSource;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var connectionShape = elementRegistry.get('PlanItemOnPart_1_di');
        var sourceShape = elementRegistry.get('PI_Task_3');

        source = connectionShape.source.businessObject;
        target = connectionShape.target.businessObject;

        newSource = sourceShape.businessObject;

        connection = connectionShape.businessObject;
        onPart = connection.cmmnElementRef;

        var newWaypoints = [{
          x: sourceShape.x + 100,
          y: sourceShape.y + 40
        }, connectionShape.waypoints[1]];

        // when
        modeling.reconnectStart(connectionShape, sourceShape, newWaypoints);

      }));


      it('should execute', function() {
        // then
        expect(onPart.sourceRef).to.equal(newSource);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(onPart.sourceRef).to.equal(newSource);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));

    });


    describe('reconnectStart set exit criterion as source', function() {

      var host, newSource;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var connectionShape = elementRegistry.get('PlanItemOnPart_1_di');
        var sourceShape = elementRegistry.get('ExitCriterion_6');

        source = connectionShape.source.businessObject;
        target = connectionShape.target.businessObject;

        newSource = sourceShape.businessObject;
        host = sourceShape.host.businessObject;

        connection = connectionShape.businessObject;
        onPart = connection.cmmnElementRef;

        var newWaypoints = [{
          x: sourceShape.x + 100,
          y: sourceShape.y + 40
        }, connectionShape.waypoints[1]];

        // when
        modeling.reconnectStart(connectionShape, sourceShape, newWaypoints);

      }));


      it('should execute', function() {
        // then
        expect(onPart.sourceRef).to.equal(host);
        expect(onPart.exitCriterionRef).to.equal(newSource);
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(onPart.sourceRef).to.equal(host);
        expect(onPart.exitCriterionRef).to.equal(newSource);
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));

    });


    describe('reconnectEnd', function() {

      var newTarget;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var connectionShape = elementRegistry.get('PlanItemOnPart_1_di');
        var targetShape = elementRegistry.get('ExitCriterion_2');

        source = connectionShape.source.businessObject;
        target = connectionShape.target.businessObject;

        newTarget = targetShape.businessObject;

        connection = connectionShape.businessObject;
        onPart = connection.cmmnElementRef;

        var newWaypoints = [
          connectionShape.waypoints[0],
          {
            x: targetShape.x,
            y: targetShape.y + 14
          }
        ];

        // when
        modeling.reconnectEnd(connectionShape, targetShape, newWaypoints);

      }));


      it('should execute', function() {
        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(newTarget);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(newTarget);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));

    });

  });


  describe('update case file item file item on part', function() {

    var testXML = require('./CmmnUpdater.case-file-item-on-part.cmmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));

    var rootElement;

    beforeEach(inject(function(canvas) {
      rootElement = canvas.getRootElement();
    }));

    var connection, onPart, source, target;

    describe('delete', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var connectionShape = elementRegistry.get('CaseFileItemOnPart_1_di');

        source = connectionShape.source.businessObject;
        target = connectionShape.target.businessObject;

        connection = connectionShape.businessObject;

        onPart = connection.cmmnElementRef;

        // when
        modeling.removeConnection(connectionShape);

      }));


      it('should execute', function() {
        // then
        expect(onPart.sourceRef).not.to.exist;
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).not.to.exist;

        expect(connection.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.include(connection);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(onPart.sourceRef).not.to.exist;
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).not.to.exist;

        expect(connection.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.include(connection);
      }));

    });


    describe('create', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var sourceShape = elementRegistry.get('CaseFileItem_2');
        var targetShape = elementRegistry.get('ExitCriterion_2');

        source = sourceShape.businessObject;
        target = targetShape.businessObject;

        // when
        var connectionShape = modeling.connect(sourceShape, targetShape, { type: 'cmmn:CaseFileItemOnPart' });

        connection = connectionShape.businessObject;
        onPart = connection.cmmnElementRef;

      }));


      it('should execute', function() {
        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.sourceRef).not.to.exist;
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).not.to.exist;

        expect(connection.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.include(connection);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));

    });


    describe('reconnectStart', function() {

      var newSource;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var connectionShape = elementRegistry.get('CaseFileItemOnPart_1_di');
        var sourceShape = elementRegistry.get('CaseFileItem_2');

        source = connectionShape.source.businessObject;
        target = connectionShape.target.businessObject;

        newSource = sourceShape.businessObject;

        connection = connectionShape.businessObject;
        onPart = connection.cmmnElementRef;

        var newWaypoints = [{
          x: sourceShape.x + 100,
          y: sourceShape.y + 40
        }, connectionShape.waypoints[1]];

        // when
        modeling.reconnectStart(connectionShape, sourceShape, newWaypoints);

      }));


      it('should execute', function() {
        // then
        expect(onPart.sourceRef).to.equal(newSource);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(onPart.sourceRef).to.equal(newSource);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));

    });


    describe('reconnectEnd', function() {

      var newTarget;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var connectionShape = elementRegistry.get('CaseFileItemOnPart_1_di');
        var targetShape = elementRegistry.get('ExitCriterion_2');

        source = connectionShape.source.businessObject;
        target = connectionShape.target.businessObject;

        newTarget = targetShape.businessObject;

        connection = connectionShape.businessObject;
        onPart = connection.cmmnElementRef;

        var newWaypoints = [
          connectionShape.waypoints[0],
          {
            x: targetShape.x,
            y: targetShape.y + 14
          }
        ];

        // when
        modeling.reconnectEnd(connectionShape, targetShape, newWaypoints);

      }));


      it('should execute', function() {
        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(newTarget);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(target);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(onPart.sourceRef).to.equal(source);
        expect(onPart.exitCriterionRef).not.to.exist;
        expect(connection.targetCMMNElementRef).to.equal(newTarget);

        expect(connection.$parent).to.equal(rootElement.businessObject);
        expect(rootElement.businessObject.diagramElements).to.include(connection);
      }));

    });

  });


  describe('update itemRegistry', function() {

    var testXML = require('./CmmnUpdater.cmmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));

    describe('should add to itemRegistry', function() {

      var bo;

      beforeEach(inject(function(elementFactory, elementRegistry, modeling) {

        // given
        var task = elementFactory.createPlanItemShape('cmmn:Task'),
            casePlanModel = elementRegistry.get('CasePlan_1');

        bo = task.businessObject;

        // when
        modeling.createShape(task, { x: 150, y: 490 }, casePlanModel);

      }));


      it('should execute', inject(function(itemRegistry) {
        // then
        expect(itemRegistry.get(bo.id)).to.exist;
        expect(itemRegistry.get(bo.id)).to.equal(bo);

        expect(itemRegistry.getReferences(bo.definitionRef)).to.have.length(1);
        expect(itemRegistry.getReferences(bo.definitionRef)).to.include(bo);
      }));


      it('should undo', inject(function(itemRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(itemRegistry.get(bo.id)).not.to.exist;

        expect(itemRegistry.getReferences(bo.definitionRef)).to.be.empty;
      }));


      it('should redo', inject(function(itemRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(itemRegistry.get(bo.id)).to.exist;
        expect(itemRegistry.get(bo.id)).to.equal(bo);

        expect(itemRegistry.getReferences(bo.definitionRef)).to.have.length(1);
        expect(itemRegistry.getReferences(bo.definitionRef)).to.include(bo);
      }));

    });


    describe('should remove from itemRegistry', function() {

      var bo;

      beforeEach(inject(function(elementFactory, elementRegistry, modeling) {

        // given
        var stage = elementRegistry.get('PI_Stage_3');

        bo = stage.businessObject;

        // when
        modeling.removeElements([ stage ]);

      }));


      it('should execute', inject(function(itemRegistry) {
        // then
        expect(itemRegistry.get(bo.id)).not.to.exist;

        expect(itemRegistry.getReferences(bo.definitionRef)).to.be.empty;
      }));


      it('should undo', inject(function(itemRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(itemRegistry.get(bo.id)).to.exist;
        expect(itemRegistry.get(bo.id)).to.equal(bo);

        expect(itemRegistry.getReferences(bo.definitionRef)).to.have.length(1);
        expect(itemRegistry.getReferences(bo.definitionRef)).to.include(bo);
      }));


      it('should redo', inject(function(itemRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(itemRegistry.get(bo.id)).not.to.exist;

        expect(itemRegistry.getReferences(bo.definitionRef)).to.be.empty;
      }));

    });

  });


  describe('connection cropping', function() {

    var testXML = require('./CmmnUpdater.discretionary-connection.cmmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));

    var connection;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('PI_Task_4'),
          target = elementRegistry.get('DIS_Task_3');

      // when
      connection = modeling.createConnection(source, target, {
        type: 'cmmndi:CMMNEdge'
      }, source.parent);

    }));


    it('should execute', inject(function(cmmnFactory) {

      // expect cropped connection
      expect(connection.waypoints).eql([
        { original: { x: 150, y: 240 }, x: 200, y: 240 },
        { original: { x: 350, y: 240 }, x: 300, y: 240 }
      ]);

      var diWaypoints = cmmnFactory.createDiWaypoints([
        { x: 200, y: 240 },
        { x: 300, y: 240 }
      ]);

      // expect cropped waypoints in di
      expect(connection.businessObject.waypoint).eql(diWaypoints);

    }));

  });

});