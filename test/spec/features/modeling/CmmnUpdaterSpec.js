'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling CmmnUpdater', function() {

  var testModules = [ coreModule, modelingModule ];

  var testXML = require('./CmmnUpdater.cmmn');

  beforeEach(bootstrapModeler(testXML, { modules: testModules }));

  describe('update parent', function() {

    describe('for task', function() {

      var task_PI;

      beforeEach(inject(function(elementFactory) {
        task_PI = elementFactory.createPlanItemShape('cmmn:Task');
      }));

      it('should set case plan', inject(function(modeling, elementRegistry) {

        // given
        var casePlan = elementRegistry.get('CasePlan_1');

        // when
        modeling.createShape(task_PI, { x: 150, y: 490 }, casePlan);

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
      }));


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
        expect(task_PI_BO.$parent).to.equal(stage_1_PI_BO);

        // check parent containment
        expect(stage_1_PI_BO.definitionRef.get('planItems')).to.include(task_PI_BO);
        expect(stage_1_PI_BO.definitionRef.get('planItemDefinitions')).to.include(task_PI_BO.definitionRef);

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
        expect(task_PI_BO.$parent).to.equal(stage_2_PI_BO);

        // check parent containment
        expect(stage_2_PI_BO.definitionRef.get('planItems')).to.include(task_PI_BO);
        expect(stage_2_PI_BO.definitionRef.get('planItemDefinitions')).to.include(task_PI_BO.definitionRef);

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
        expect(task_PI_BO.$parent).to.equal(stage_3_PI_BO);

        // check parent containment
        expect(stage_3_PI_BO.definitionRef.get('planItems')).to.include(task_PI_BO);
        expect(stage_3_PI_BO.definitionRef.get('planItemDefinitions')).to.include(task_PI_BO.definitionRef);

      }));
    });


    describe('for expanded stage', function() {

      var stage_PI;

      beforeEach(inject(function(elementFactory) {
        stage_PI = elementFactory.createPlanItemShape('cmmn:Stage');
      }));


      it('should set case plan', inject(function(modeling, elementRegistry) {

        // given
        var casePlan = elementRegistry.get('CasePlan_1');

        // when
        modeling.createShape(stage_PI, { x: 150, y: 490 }, casePlan);

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
      }));


      it('should set stage', inject(function(modeling, elementRegistry) {

        // given
        var stage_1_PI = elementRegistry.get('PI_Stage_1');

        // when
        modeling.createShape(stage_PI, { x: 150, y: 405 }, stage_1_PI);

        var stage_1_PI_BO = stage_1_PI.businessObject,
            stage_PI_BO = stage_PI.businessObject;

        // then
        // check parent PI
        expect(stage_PI.parent).to.equal(stage_1_PI);

        // check semantic parent
        expect(stage_PI_BO.$parent).to.exist;
        expect(stage_PI_BO.$parent).to.equal(stage_1_PI_BO);

        // check parent containment
        expect(stage_1_PI_BO.definitionRef.get('planItems')).to.include(stage_PI_BO);
        expect(stage_1_PI_BO.definitionRef.get('planItemDefinitions')).to.include(stage_PI_BO.definitionRef);

      }));

    });

  });

});


