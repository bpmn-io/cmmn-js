'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #PlanItemDefinitionUpdater', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('replace', function() {

    var diagramXML = require('./PlanItemDefinitionUpdater.replace.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('should add new plan item definition to same parent', function() {

      var casePlanModel, oldParent, oldPlanItemDefinition, newPlanItemDefinition;

      beforeEach(inject(function(elementRegistry, modeling, cmmnReplace) {

        // given
        casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

        var task = elementRegistry.get('PI_HumanTask_1');
        oldPlanItemDefinition = task.businessObject.definitionRef;
        oldParent = oldPlanItemDefinition.$parent;

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

        expect(newPlanItemDefinition.$parent).to.equal(oldParent);
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

        expect(newPlanItemDefinition.$parent).to.equal(oldParent);
      }));

    });

  });

});
