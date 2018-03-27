'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    replaceModule = require('../../../../lib/features/replace'),
    coreModule = require('../../../../lib/core');

var is = require('../../../../lib/util/ModelUtil').is;

describe('features/replace - cmmn replace', function() {

  var testModules = [ coreModule, modelingModule, replaceModule ];

  describe('should replace', function() {

    var diagramXML = require('./CmmnReplace.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var oldElement, newElement;

    describe('task -> human task', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_Task_1');

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:HumanTask'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:HumanTask')).to.be.true;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:HumanTask')).to.be.true;
      }));

    });


    describe('event listener -> user event listener', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_EventListener_1');

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:UserEventListener'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:UserEventListener')).to.be.true;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:UserEventListener')).to.be.true;
      }));

    });


    describe('plan item -> discretionary item', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_Task_1');

        var newElementData = {
          type: 'cmmn:DiscretionaryItem',
          definitionType: 'cmmn:HumanTask'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:DiscretionaryItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:HumanTask')).to.be.true;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:DiscretionaryItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:HumanTask')).to.be.true;
      }));

    });


    describe('plan item -> discretionary item (same definition)', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('DIS_Task_2');

        var newElementData = {
          type: 'cmmn:DiscretionaryItem',
          definitionType: 'cmmn:Task'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:DiscretionaryItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Task')).to.be.true;

        expect(oldElement.businessObject.definitionRef).to.equal(definition);
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:DiscretionaryItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Task')).to.be.true;

        expect(oldElement.businessObject.definitionRef).to.equal(definition);
      }));

    });


    describe('discretionary item -> plan item', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('DIS_Task_2');

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:HumanTask'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:HumanTask')).to.be.true;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:HumanTask')).to.be.true;
      }));

    });


    describe('discretionary item -> plan item (same definition)', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('DIS_Task_2');

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:Task'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Task')).to.be.true;

        expect(oldElement.businessObject.definitionRef).to.equal(definition);
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Task')).to.be.true;

        expect(oldElement.businessObject.definitionRef).to.equal(definition);
      }));

    });


    describe('task -> stage (collapsed)', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_Task_1');

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:Stage',
          isCollapsed: true
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Stage')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).to.be.true;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Stage')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).to.be.true;
      }));

    });

    describe('task -> stage (expanded)', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_Task_1');

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:Stage'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Stage')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Stage')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      }));

    });

    describe('task -> plan fragment (collapsed)', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_Task_1');

        var newElementData = {
          type: 'cmmn:DiscretionaryItem',
          definitionType: 'cmmn:PlanFragment',
          isCollapsed: true
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:DiscretionaryItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:PlanFragment')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).to.be.true;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:DiscretionaryItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:PlanFragment')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).to.be.true;
      }));

    });


    describe('task -> plan fragment (expanded)', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_Task_1');

        var newElementData = {
          type: 'cmmn:DiscretionaryItem',
          definitionType: 'cmmn:PlanFragment'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:DiscretionaryItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:PlanFragment')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:DiscretionaryItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:PlanFragment')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      }));

    });


    describe('stage (collapsed) -> task', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_Stage_2');

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:Task'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Task')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Task')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      }));

    });


    describe('plan fragment (collapsed) -> task', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('DIS_PlanFragment_1');

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:Task'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Task')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Task')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      }));

    });


    describe('stage (expanded) -> plan fragment (expanded)', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('DIS_Stage_4');

        var newElementData = {
          type: 'cmmn:DiscretionaryItem',
          definitionType: 'cmmn:PlanFragment'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:DiscretionaryItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:PlanFragment')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:DiscretionaryItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:PlanFragment')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      }));

    });


    describe('plan fragment (expanded) -> stage (expanded)', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('DIS_PlanFragment_2');

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:Stage'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Stage')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Stage')).to.be.true;

        expect(oldElement.businessObject.definitionRef).not.to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      }));

    });


    describe('stage (collapsed) -> stage (expanded)', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_Stage_2');

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:Stage',
          isCollapsed: false
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Stage')).to.be.true;

        expect(oldElement.businessObject.definitionRef).to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:PlanItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:Stage')).to.be.true;

        expect(oldElement.businessObject.definitionRef).to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      }));

    });


    describe('plan fragment (collapsed) -> plan fragment (expanded)', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('DIS_PlanFragment_1');

        var newElementData = {
          type: 'cmmn:DiscretionaryItem',
          definitionType: 'cmmn:PlanFragment',
          isCollapsed: false
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:DiscretionaryItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:PlanFragment')).to.be.true;

        expect(oldElement.businessObject.definitionRef).to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:DiscretionaryItem')).to.be.true;

        var definition = bo.definitionRef;
        expect(is(definition, 'cmmn:PlanFragment')).to.be.true;

        expect(oldElement.businessObject.definitionRef).to.equal(definition);

        expect(bo.di.isCollapsed).not.to.exist;
      }));

    });

    describe('entry criterion -> exit criterion', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('EntryCriterion_1');

        var newElementData = {
          type: 'cmmn:ExitCriterion'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:ExitCriterion')).to.be.true;

      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:ExitCriterion')).to.be.true;
      }));

    });


    describe('exit criterion -> entry criterion', function() {

      beforeEach(inject(function(elementRegistry, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('ExitCriterion_1');

        var newElementData = {
          type: 'cmmn:EntryCriterion'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:EntryCriterion')).to.be.true;

      });


      it('should undo', inject(function(commandStack, elementRegistry) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(oldElement.id)).to.exist;
        expect(elementRegistry.get(newElement.id)).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement).to.exist;

        var bo = newElement.businessObject;
        expect(is(bo, 'cmmn:EntryCriterion')).to.be.true;
      }));

    });

  });


  describe('properties', function() {

    var diagramXML = require('./CmmnReplace.properties.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    it('should retain isBlocking (=false)', inject(function(elementRegistry, cmmnReplace) {

      // given
      var task = elementRegistry.get('PI_HumanTask_1');
      var newElementData = {
        type: 'cmmn:PlanItem',
        definitionType: 'cmmn:CaseTask'
      };

      // when
      var newElement = cmmnReplace.replaceElement(task, newElementData);

      // then
      expect(newElement.businessObject.definitionRef.isBlocking).to.be.false;

    }));


    it('should retain isBlocking (=true)', inject(function(elementRegistry, cmmnReplace) {

      // given
      var task = elementRegistry.get('PI_HumanTask_2');
      var newElementData = {
        type: 'cmmn:PlanItem',
        definitionType: 'cmmn:CaseTask'
      };

      // when
      var newElement = cmmnReplace.replaceElement(task, newElementData);

      // then
      expect(newElement.businessObject.definitionRef.isBlocking).to.be.true;

    }));


    it('should set isBlocking to true', inject(function(elementRegistry, cmmnReplace) {

      // given
      var task = elementRegistry.get('DIS_PlanFragment_1');
      var newElementData = {
        type: 'cmmn:PlanItem',
        definitionType: 'cmmn:HumanTask'
      };

      // when
      var newElement = cmmnReplace.replaceElement(task, newElementData);

      // then
      expect(newElement.businessObject.definitionRef.isBlocking).to.be.true;

    }));


    it('should retain isPlanningTableCollapsed', inject(function(elementRegistry, cmmnReplace) {

      // given
      var stage = elementRegistry.get('PI_HumanTask_2');
      var newElementData = {
        type: 'cmmn:DiscretionaryItem',
        definitionType: 'cmmn:HumanTask'
      };

      // when
      var newElement = cmmnReplace.replaceElement(stage, newElementData);

      // then
      expect(newElement.businessObject.di.isPlanningTableCollapsed).to.be.true;

    }));


    it('should retain isCollapsed', inject(function(elementRegistry, cmmnReplace) {

      // given
      var stage = elementRegistry.get('DIS_PlanFragment_1');
      var newElementData = {
        type: 'cmmn:PlanItem',
        definitionType: 'cmmn:Stage'
      };

      // when
      var newElement = cmmnReplace.replaceElement(stage, newElementData);

      // then
      expect(newElement.businessObject.di.isCollapsed).to.be.true;

    }));

  });


  describe('position', function() {

    var diagramXML = require('./CmmnReplace.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should keep position', inject(function(elementRegistry, cmmnReplace) {

      // given
      var task = elementRegistry.get('PI_Task_1');
      var newElementData = {
        type: 'cmmn:PlanItem',
        definitionType: 'cmmn:HumanTask'
      };

      // when
      var newElement = cmmnReplace.replaceElement(task, newElementData);

      // then
      expect(newElement.x).to.equal(task.x);
      expect(newElement.y).to.equal(task.y);
    }));

    it('should keep label position', inject(function(elementRegistry, cmmnReplace, modeling) {

      // given
      var listener = elementRegistry.get('PI_EventListener_1');
      var label = elementRegistry.get('PI_EventListener_1_label');

      var newElementData = {
        type: 'cmmn:PlanItem',
        definitionType: 'cmmn:TimerEventListener'
      };

      // when
      var newElement = cmmnReplace.replaceElement(listener, newElementData);

      // then
      expect(newElement.label.x).to.equal(label.x);
      expect(newElement.label.y).to.equal(label.y);

    }));

  });


  describe('connection handling', function() {

    var diagramXML = require('./CmmnReplace.connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('discretionary connection', function() {

      describe('replacing DiscretionaryItem -> PlanItem = delete connection', function() {

        beforeEach(inject(function(elementRegistry, modeling, cmmnReplace) {
          // given
          var element = elementRegistry.get('DIS_Task_1');

          var target = {
            type: 'cmmn:PlanItem',
            definitionType: 'cmmn:Task'
          };

          // when
          cmmnReplace.replaceElement(element, target);
        }));


        it('should execute', inject(function(elementRegistry) {
          // then
          expect(elementRegistry.get('DiscretionaryConnection_1')).not.to.exist;
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get('DiscretionaryConnection_1')).to.exist;
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(elementRegistry.get('DiscretionaryConnection_1')).not.to.exist;

        }));

      });


      describe('replacing DiscretionaryItem -> PlanItem = delete connection', function() {

        beforeEach(inject(function(elementRegistry, modeling, cmmnReplace) {
          // given
          var element = elementRegistry.get('DIS_Task_1');

          var target = {
            type: 'cmmn:DiscretionaryItem',
            definitionType: 'cmmn:HumanTask'
          };

          // when
          cmmnReplace.replaceElement(element, target);
        }));


        it('should execute', inject(function(elementRegistry) {
          // then
          expect(elementRegistry.get('DiscretionaryConnection_1')).to.exist;
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get('DiscretionaryConnection_1')).to.exist;
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(elementRegistry.get('DiscretionaryConnection_1')).to.exist;

        }));

      });

    });


    describe('plan item on part connection', function() {

      describe('replacing PlanItem -> DiscretionaryItem = delete connection', function() {

        beforeEach(inject(function(elementRegistry, modeling, cmmnReplace) {
          // given
          var element = elementRegistry.get('PI_Task_2');

          var target = {
            type: 'cmmn:DiscretionaryItem',
            definitionType: 'cmmn:Task'
          };

          // when
          cmmnReplace.replaceElement(element, target);
        }));


        it('should execute', inject(function(elementRegistry) {
          // then
          expect(elementRegistry.get('PlanItemOnPart_1_di')).not.to.exist;
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
          expect(elementRegistry.get('PlanItemOnPart_1_di')).not.to.exist;
        }));

      });


      describe('replacing PlanItem -> PlanItem = keep connection', function() {

        beforeEach(inject(function(elementRegistry, modeling, cmmnReplace) {
          // given
          var element = elementRegistry.get('PI_Task_2');

          var target = {
            type: 'cmmn:PlanItem',
            definitionType: 'cmmn:HumanTask'
          };

          // when
          cmmnReplace.replaceElement(element, target);
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


    });

  });


  describe('selection', function() {

    var diagramXML = require('./CmmnReplace.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should select after replace',
      inject(function(elementRegistry, selection, cmmnReplace) {

        // given
        var task = elementRegistry.get('PI_Task_1');
        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:HumanTask'
        };

        // when
        var newElement = cmmnReplace.replaceElement(task, newElementData);

        // then
        expect(selection.get()).to.include(newElement);
      })
    );

  });


  describe('label', function() {

    var diagramXML = require('./CmmnReplace.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    it('should keep interior labels',
      inject(function(elementRegistry, cmmnReplace) {

        // given
        var task = elementRegistry.get('PI_Task_1');

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:HumanTask'
        };

        // when
        var newElement = cmmnReplace.replaceElement(task, newElementData);

        // then
        expect(newElement.businessObject.definitionRef.name).to.equal('FOO');
      })
    );


    it('should keep exterior labels',
      inject(function(elementRegistry, cmmnReplace) {

        // given
        var startEvent = elementRegistry.get('PI_EventListener_1');

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:TimerEventListener'
        };

        // when
        var newElement = cmmnReplace.replaceElement(startEvent, newElementData);

        // then
        expect(newElement.label.hidden).to.equal(false);
        expect(newElement.label.labelTarget).to.equal(newElement);
        expect(newElement.businessObject.definitionRef.name).to.equal('Keep label');
      })
    );

  });


  describe('elements', function() {

    var diagramXML = require('../../../fixtures/cmmn/simple.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    describe('criterion', function() {

      it('should set properties', inject(function(moddle, cmmnReplace) {
        // given
        var criterion = moddle.create('cmmn:EntryCriterion', {
          name: ' FOO',
          sentryRef: moddle.create('cmmn:Sentry')
        });

        // when
        var replaced = cmmnReplace.replaceCriterion(criterion);

        // then
        expect(replaced).not.to.equal(criterion);
        expect(replaced.name).to.equal(criterion.name);
        expect(replaced.sentryRef).to.equal(criterion.sentryRef);

      }));


      it('should replace with same criterion type', inject(function(moddle, cmmnReplace) {
        // given
        var criterion = moddle.create('cmmn:EntryCriterion');

        // when
        var replaced = cmmnReplace.replaceCriterion(criterion);

        // then
        expect(replaced.$type).to.equal(criterion.$type);

      }));


      it('should replace with exit criterion', inject(function(moddle, cmmnReplace) {
        // given
        var criterion = moddle.create('cmmn:EntryCriterion');

        // when
        var replaced = cmmnReplace.replaceCriterion(criterion, 'cmmn:ExitCriterion');

        // then
        expect(replaced.$type).to.equal('cmmn:ExitCriterion');

      }));

    });


    describe('sentry', function() {

      it('should set properties', inject(function(moddle, cmmnReplace) {
        // given
        var sentry = moddle.create('cmmn:Sentry', {
          name: ' FOO'
        });

        // when
        var replaced = cmmnReplace.replaceSentry(sentry);

        // then
        expect(replaced).not.to.equal(sentry);
        expect(replaced.name).to.equal(sentry.name);
      }));


      it('should set ifPart', inject(function(moddle, cmmnReplace) {

        // given
        var ifPart = moddle.create('cmmn:IfPart', {
          condition: moddle.create('cmmn:Expression', {
            language: 'juel',
            body: 'a === b'
          })
        });

        var sentry = moddle.create('cmmn:Sentry', {
          ifPart: ifPart
        });

        // when
        var replaced = cmmnReplace.replaceSentry(sentry);

        // then
        expect(replaced.ifPart).to.exist;
        expect(replaced.ifPart).not.to.equal(sentry.ifPart);
        expect(replaced.ifPart.condition).not.to.equal(sentry.ifPart.condition);
        expect(replaced.ifPart.condition.language).to.equal(sentry.ifPart.condition.language);
        expect(replaced.ifPart.condition.body).to.equal(sentry.ifPart.condition.body);

        expect(replaced.ifPart.$parent).to.equal(replaced);

      }));


      it('should NOT set onParts', inject(function(moddle, cmmnReplace) {

        // given
        var sentry = moddle.create('cmmn:Sentry', {
          onParts: [ moddle.create('cmmn:PlanItemOnPart') ]
        });

        // when
        var replaced = cmmnReplace.replaceSentry(sentry);

        // then
        expect(replaced.get('onParts')).to.be.empty;

      }));

    });


    describe('plan item definition', function() {

      it('should set properties', inject(function(moddle, cmmnReplace) {

        // given
        var definition = moddle.create('cmmn:Task', {
          name: 'FOO'
        });

        // when
        var replaced = cmmnReplace.replacePlanItemDefinition(definition);

        // then
        expect(replaced).not.to.equal(definition);
        expect(replaced.name).to.equal(definition.name);

      }));


      it('should keep type', inject(function(moddle, cmmnReplace) {

        // given
        var definition = moddle.create('cmmn:Task');

        // when
        var replaced = cmmnReplace.replacePlanItemDefinition(definition);

        // then
        expect(replaced).not.to.equal(definition);
        expect(replaced.$type).to.equal(definition.$type);

      }));


      it('should NOT keep type', inject(function(moddle, cmmnReplace) {

        // given
        var definition = moddle.create('cmmn:Task');

        // when
        var replaced = cmmnReplace.replacePlanItemDefinition(definition, 'cmmn:HumanTask');

        // then
        expect(replaced).not.to.equal(definition);
        expect(replaced.$type).not.to.equal(definition.$type);
        expect(replaced.$type).to.equal('cmmn:HumanTask');

      }));

      it('should keep non-blocking flag', inject(function(moddle, cmmnReplace) {

        // given
        var definition = moddle.create('cmmn:Task', {
          isBlocking: false
        });

        // when
        var replaced = cmmnReplace.replacePlanItemDefinition(definition);

        // then
        expect(replaced.isBlocking).to.equal(definition.isBlocking);

      }));


      it('should also replace defaultControl', inject(function(moddle, cmmnReplace) {

        // given
        var definition = moddle.create('cmmn:Task', {
          defaultControl: moddle.create('cmmn:PlanItemControl')
        });

        // when
        var replaced = cmmnReplace.replacePlanItemDefinition(definition);

        // then
        expect(replaced.defaultControl).to.exist;
        expect(replaced.defaultControl).not.to.equal(definition.defaultControl);

        expect(replaced.defaultControl.$parent).to.equal(replaced);

      }));

    });


    describe('plan item control', function() {

      it('should keep repetition rule', inject(function(moddle, cmmnReplace) {

        // given
        var planItemControl = moddle.create('cmmn:PlanItemControl', {
          repetitionRule: moddle.create('cmmn:RepetitionRule', {
            condition: moddle.create('cmmn:Expression', {
              language: 'juel',
              body: 'a === b'
            })
          })
        });

        // when
        var replaced = cmmnReplace.replacePlanItemControl(planItemControl);

        // then
        expect(replaced).not.to.equal(planItemControl);

        expect(replaced.repetitionRule).to.exist;
        expect(replaced.repetitionRule).not.to.equal(planItemControl.repetitionRule);

        expect(replaced.repetitionRule.condition).to.exist;
        expect(replaced.repetitionRule.condition).not.to.equal(planItemControl.repetitionRule.condition);

        var newCondition = replaced.repetitionRule.condition,
            oldCondition = planItemControl.repetitionRule.condition;

        expect(newCondition.language).to.equal(oldCondition.language);
        expect(newCondition.body).to.equal(oldCondition.body);

        expect(replaced.repetitionRule.$parent).to.equal(replaced);

      }));


      it('should keep required rule', inject(function(moddle, cmmnReplace) {

        // given
        var planItemControl = moddle.create('cmmn:PlanItemControl', {
          requiredRule: moddle.create('cmmn:RequiredRule', {
            condition: moddle.create('cmmn:Expression', {
              language: 'juel',
              body: 'a === b'
            })
          })
        });

        // when
        var replaced = cmmnReplace.replacePlanItemControl(planItemControl);

        // then
        expect(replaced).not.to.equal(planItemControl);

        expect(replaced.requiredRule).to.exist;
        expect(replaced.requiredRule).not.to.equal(planItemControl.requiredRule);

        expect(replaced.requiredRule.condition).to.exist;
        expect(replaced.requiredRule.condition).not.to.equal(planItemControl.requiredRule.condition);

        var newCondition = replaced.requiredRule.condition,
            oldCondition = planItemControl.requiredRule.condition;

        expect(newCondition.language).to.equal(oldCondition.language);
        expect(newCondition.body).to.equal(oldCondition.body);

        expect(replaced.requiredRule.$parent).to.equal(replaced);

      }));


      it('should keep manual activation rule', inject(function(moddle, cmmnReplace) {

        // given
        var planItemControl = moddle.create('cmmn:PlanItemControl', {
          manualActivationRule: moddle.create('cmmn:ManualActivationRule', {
            condition: moddle.create('cmmn:Expression', {
              language: 'juel',
              body: 'a === b'
            })
          })
        });

        // when
        var replaced = cmmnReplace.replacePlanItemControl(planItemControl);

        // then
        expect(replaced).not.to.equal(planItemControl);

        expect(replaced.manualActivationRule).to.exist;
        expect(replaced.manualActivationRule).not.to.equal(planItemControl.manualActivationRule);

        expect(replaced.manualActivationRule.condition).to.exist;
        expect(replaced.manualActivationRule.condition).not.to.equal(planItemControl.manualActivationRule.condition);

        var newCondition = replaced.manualActivationRule.condition,
            oldCondition = planItemControl.manualActivationRule.condition;

        expect(newCondition.language).to.equal(oldCondition.language);
        expect(newCondition.body).to.equal(oldCondition.body);

        expect(replaced.manualActivationRule.$parent).to.equal(replaced);

      }));

    });


    describe('plan item', function() {

      it('should set properties', inject(function(moddle, cmmnReplace) {

        // given
        var planItem = moddle.create('cmmn:PlanItem', {
          name: 'FOO'
        });

        // when
        var replaced = cmmnReplace.replaceItemCapable(planItem);

        // then
        expect(replaced.name).to.equal(planItem.name);

      }));


      it('should keep definitionRef', inject(function(moddle, cmmnReplace) {

        // given
        var planItem = moddle.create('cmmn:PlanItem', {
          definitionRef: moddle.create('cmmn:Task')
        });

        // when
        var replaced = cmmnReplace.replaceItemCapable(planItem);

        // then
        expect(replaced.definitionRef).to.equal(planItem.definitionRef);

      }));


      it('should keep type', inject(function(moddle, cmmnReplace) {

        // given
        var planItem = moddle.create('cmmn:PlanItem');

        // when
        var replaced = cmmnReplace.replaceItemCapable(planItem);

        // then
        expect(replaced).not.to.equal(planItem);
        expect(replaced.$type).to.equal(planItem.$type);

      }));


      it('should replace with discretionary item', inject(function(moddle, cmmnReplace) {

        // given
        var planItem = moddle.create('cmmn:PlanItem');

        // when
        var replaced = cmmnReplace.replaceItemCapable(planItem, 'cmmn:DiscretionaryItem');

        // then
        expect(replaced).not.to.equal(planItem);
        expect(replaced.$type).not.to.equal(planItem.$type);
        expect(replaced.$type).to.equal('cmmn:DiscretionaryItem');

      }));


      it('should replace itemControl', inject(function(moddle, cmmnReplace) {

        // given
        var planItem = moddle.create('cmmn:PlanItem', {
          itemControl: moddle.create('cmmn:PlanItemControl'),
          definitionRef: moddle.create('cmmn:Task')
        });

        // when
        var replaced = cmmnReplace.replaceItemCapable(planItem);

        // then
        expect(replaced.itemControl).to.exist;
        expect(replaced.itemControl).not.to.equal(planItem.itemControl);

        expect(replaced.itemControl.$parent).to.equal(replaced);

      }));

    });


    describe('discretionary item', function() {

      it('should set properties', inject(function(moddle, cmmnReplace) {

        // given
        var planItem = moddle.create('cmmn:DiscretionaryItem', {
          name: 'FOO'
        });

        // when
        var replaced = cmmnReplace.replaceItemCapable(planItem);

        // then
        expect(replaced.name).to.equal(planItem.name);

      }));


      it('should keep definitionRef', inject(function(moddle, cmmnReplace) {

        // given
        var planItem = moddle.create('cmmn:DiscretionaryItem', {
          definitionRef: moddle.create('cmmn:Task')
        });

        // when
        var replaced = cmmnReplace.replaceItemCapable(planItem);

        // then
        expect(replaced.definitionRef).to.equal(planItem.definitionRef);

      }));


      it('should keep type', inject(function(moddle, cmmnReplace) {

        // given
        var planItem = moddle.create('cmmn:DiscretionaryItem');

        // when
        var replaced = cmmnReplace.replaceItemCapable(planItem);

        // then
        expect(replaced).not.to.equal(planItem);
        expect(replaced.$type).to.equal(planItem.$type);

      }));


      it('should replace with discretionary item', inject(function(moddle, cmmnReplace) {

        // given
        var planItem = moddle.create('cmmn:DiscretionaryItem');

        // when
        var replaced = cmmnReplace.replaceItemCapable(planItem, 'cmmn:PlanItem');

        // then
        expect(replaced).not.to.equal(planItem);
        expect(replaced.$type).not.to.equal(planItem.$type);
        expect(replaced.$type).to.equal('cmmn:PlanItem');

      }));


      it('should replace itemControl', inject(function(moddle, cmmnReplace) {

        // given
        var planItem = moddle.create('cmmn:DiscretionaryItem', {
          itemControl: moddle.create('cmmn:PlanItemControl'),
          definitionRef: moddle.create('cmmn:Task')
        });

        // when
        var replaced = cmmnReplace.replaceItemCapable(planItem);

        // then
        expect(replaced.itemControl).to.exist;
        expect(replaced.itemControl).not.to.equal(planItem.itemControl);

        expect(replaced.itemControl.$parent).to.equal(replaced);
      }));

    });


    describe('rule', function() {

      it('should replace repetition rule', inject(function(moddle, cmmnReplace) {

        // given
        var rule = moddle.create('cmmn:RepetitionRule', {
          condition: moddle.create('cmmn:Expression')
        });

        // when
        var replaced = cmmnReplace.replaceRule(rule);

        // then
        expect(replaced).not.to.equal(rule);

        expect(replaced.condition).to.exist;
        expect(replaced.condition).not.to.equal(rule.condition);

        expect(replaced.condition.$parent).to.equal(replaced);

      }));


      it('should replace required rule', inject(function(moddle, cmmnReplace) {

        // given
        var rule = moddle.create('cmmn:RequiredRule', {
          condition: moddle.create('cmmn:Expression')
        });

        // when
        var replaced = cmmnReplace.replaceRule(rule);

        // then
        expect(replaced).not.to.equal(rule);

        expect(replaced.condition).to.exist;
        expect(replaced.condition).not.to.equal(rule.condition);

        expect(replaced.condition.$parent).to.equal(replaced);

      }));


      it('should replace manual activation rule', inject(function(moddle, cmmnReplace) {

        // given
        var rule = moddle.create('cmmn:ManualActivationRule', {
          condition: moddle.create('cmmn:Expression')
        });

        // when
        var replaced = cmmnReplace.replaceRule(rule);

        // then
        expect(replaced).not.to.equal(rule);

        expect(replaced.condition).to.exist;
        expect(replaced.condition).not.to.equal(rule.condition);

        expect(replaced.condition.$parent).to.equal(replaced);

      }));

    });


    describe('condition', function() {

      it('should set language', inject(function(moddle, cmmnReplace) {

        // given
        var condition = moddle.create('cmmn:Expression', {
          language: 'juel'
        });

        // when
        var replaced = cmmnReplace.replaceCondition(condition);

        // then
        expect(replaced).not.to.equal(condition);
        expect(replaced.language).to.equal(condition.language);

      }));


      it('should set body', inject(function(moddle, cmmnReplace) {

        // given
        var condition = moddle.create('cmmn:Expression', {
          body: 'a === b'
        });

        // when
        var replaced = cmmnReplace.replaceCondition(condition);

        // then
        expect(replaced).not.to.equal(condition);
        expect(replaced.body).to.equal(condition.body);

      }));

    });

  });

});
