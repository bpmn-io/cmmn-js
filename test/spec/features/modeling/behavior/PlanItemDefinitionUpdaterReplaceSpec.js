'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #PlanItemDefinitionUpdater', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('replace', function() {

    describe('should add new plan item definition', function() {

      var diagramXML = require('./PlanItemDefinitionUpdater.replace.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      var oldParent, newParent, oldPlanItemDefinition, newPlanItemDefinition;

      beforeEach(inject(function(elementRegistry, modeling, cmmnReplace) {

        // given
        var task = elementRegistry.get('PI_HumanTask_1');
        oldPlanItemDefinition = task.businessObject.definitionRef;
        oldParent = oldPlanItemDefinition.$parent;

        newParent = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:CaseTask'
        };

        // when
        var newElement = cmmnReplace.replaceElement(task, newElementData);

        newPlanItemDefinition = newElement.businessObject.definitionRef;

      }));


      it('should execute', function() {
        // then
        expect(newPlanItemDefinition).not.to.equal(oldPlanItemDefinition);
        expect(oldPlanItemDefinition.$parent).not.to.exist;

        expect(newPlanItemDefinition.$parent).to.equal(newParent);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(newPlanItemDefinition).not.to.equal(oldPlanItemDefinition);
        expect(oldPlanItemDefinition.$parent).to.exist;
        expect(oldPlanItemDefinition.$parent).to.equal(oldParent);

        expect(newPlanItemDefinition.$parent).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newPlanItemDefinition).not.to.equal(oldPlanItemDefinition);
        expect(oldPlanItemDefinition.$parent).not.to.exist;

        expect(newPlanItemDefinition.$parent).to.equal(newParent);
      }));

    });


    describe('should keep plan item definition of nested replaced element', function() {

      var diagramXML = require('./PlanItemDefinitionUpdater.morph-to-plan-fragment.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      var oldNestedElement, newNestedElement, casePlanModel;

      beforeEach(inject(function(elementRegistry, modeling, cmmnReplace) {

        // given
        var shape = elementRegistry.get('PI_Stage_1');

        oldNestedElement = shape.children[0];
        casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

        var newElementData = {
          type: 'cmmn:DiscretionaryItem',
          definitionType: 'cmmn:PlanFragment'
        };

        // when
        var newElement = cmmnReplace.replaceElement(shape, newElementData);

        newNestedElement = newElement.children[0];

      }));


      it('should execute', function() {
        // then
        expect(oldNestedElement.businessObject.definitionRef.$parent).not.to.exist;

        expect(newNestedElement.businessObject.definitionRef.$parent).to.exist;
        expect(newNestedElement.businessObject.definitionRef.$parent).to.equal(casePlanModel);
        expect(casePlanModel.get('planItemDefinitions')).to.include(newNestedElement.businessObject.definitionRef);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldNestedElement.businessObject.definitionRef.$parent).to.exist;

        expect(newNestedElement.businessObject.definitionRef.$parent).not.to.exist;
        expect(casePlanModel.get('planItemDefinitions')).not.to.include(newNestedElement.businessObject.definitionRef);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldNestedElement.businessObject.definitionRef.$parent).not.to.exist;

        expect(newNestedElement.businessObject.definitionRef.$parent).to.exist;
        expect(newNestedElement.businessObject.definitionRef.$parent).to.equal(casePlanModel);
        expect(casePlanModel.get('planItemDefinitions')).to.include(newNestedElement.businessObject.definitionRef);
      }));

    });

  });

});
