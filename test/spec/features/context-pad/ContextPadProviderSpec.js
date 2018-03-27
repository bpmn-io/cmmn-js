'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

var domQuery = require('min-dom').query;

var is = require('../../../../lib/util/ModelUtil').is;


/* global bootstrapModeler, inject */


var contextPadModule = require('../../../../lib/features/context-pad'),
    coreModule = require('../../../../lib/core'),
    modelingModule = require('../../../../lib/features/modeling'),
    customRulesModule = require('../../../util/custom-rules');


describe('features - context-pad', function() {

  var testModules = [
    coreModule,
    modelingModule,
    contextPadModule,
    customRulesModule
  ];


  describe('remove action rules', function() {

    var diagramXML = require('../../../fixtures/cmmn/simple.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    var deleteAction;

    beforeEach(inject(function(contextPad) {

      deleteAction = function(element) {
        return padEntry(contextPad.getPad(element).html, 'delete');
      };
    }));


    it('should add delete action by default', inject(function(elementRegistry, contextPad) {

      // given
      var element = elementRegistry.get('PI_Task_1');

      // when
      contextPad.open(element);

      // then
      expect(deleteAction(element)).to.exist;
    }));


    it('should include delete action when rule returns true',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        customRules.addRule('elements.delete', function() {
          return true;
        });

        var element = elementRegistry.get('PI_Task_1');

        // when
        contextPad.open(element);

        // then
        expect(deleteAction(element)).to.exist;
      })
    );


    it('should NOT include delete action when rule returns false',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        customRules.addRule('elements.delete', 1500, function() {
          return false;
        });

        var element = elementRegistry.get('PI_Task_1');

        // when
        contextPad.open(element);

        // then
        expect(deleteAction(element)).to.not.exist;
      })
    );


    it('should call rules with [ element ]', inject(function(elementRegistry, contextPad, customRules) {

      // given
      var element = elementRegistry.get('PI_Task_1');

      customRules.addRule('elements.delete', function(context) {

        // element array is actually passed
        expect(context.elements).to.eql([ element ]);

        return true;
      });

      // then
      expect(function() {
        contextPad.open(element);
      }).not.to.throw;

    }));


    it('should include delete action when [ element ] is returned from rule',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        customRules.addRule('elements.delete', function(context) {
          return context.elements;
        });

        var element = elementRegistry.get('PI_Task_1');

        // when
        contextPad.open(element);

        // then
        expect(deleteAction(element)).to.exist;
      })
    );


    it('should NOT include delete action when [ ] is returned from rule',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        customRules.addRule('elements.delete', 1500, function() {
          return [];
        });

        var element = elementRegistry.get('PI_Task_1');

        // when
        contextPad.open(element);

        // then
        expect(deleteAction(element)).to.not.exist;
      })
    );

  });


  describe('replace', function() {

    var diagramXML = require('./ContextPad.activation.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var container;

    beforeEach(function() {
      container = TestContainer.get(this);
    });


    it('should show popup menu in the correct position', inject(function(elementRegistry, contextPad) {

      // given
      var element = elementRegistry.get('PI_Blocking_Task_1'),
          padding = 5,
          replaceMenuRect,
          padMenuRect;

      contextPad.open(element);
      padMenuRect = contextPad.getPad(element).html.getBoundingClientRect();

      // mock event
      var event = {
        target: padEntry(container, 'replace'),
        preventDefault: function() {}
      };

      // when
      contextPad.trigger('click', event);
      replaceMenuRect = domQuery('.cmmn-replace', container).getBoundingClientRect();

      // then
      expect(replaceMenuRect.left).to.be.at.most(padMenuRect.left);
      expect(replaceMenuRect.top).to.be.at.most(padMenuRect.bottom + padding);
    }));


    it('should not include control if replacement is disallowed',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        var element = elementRegistry.get('EntryCriterion_1');

        // disallow replacement
        customRules.addRule('shape.replace', function(context) {
          return !is(context.element, 'cmmn:EntryCriterion');
        });

        // when
        contextPad.open(element);

        var padNode = contextPad.getPad(element).html;

        // then
        expect(padEntry(padNode, 'replace')).not.to.exist;
      })
    );


    it('should include control if replacement is allowed',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        var element = elementRegistry.get('ExitCriterion_4');

        // disallow replacement
        customRules.addRule('shape.replace', 1500, function(context) {
          return !is(context.element, 'cmmn:EntryCriterion');
        });

        // when
        contextPad.open(element);

        var padNode = contextPad.getPad(element).html;

        // then
        expect(padEntry(padNode, 'replace')).to.exist;
      })
    );

  });


  describe('available entries', function() {

    var diagramXML = require('./ContextPad.activation.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    function expectContextPadEntries(elementOrId, expectedEntries) {

      TestHelper.getCmmnJs().invoke(function(elementRegistry, contextPad) {

        var element = typeof elementOrId === 'string' ? elementRegistry.get(elementOrId) : elementOrId;

        contextPad.open(element, true);

        var entries = contextPad._current.entries;

        expectedEntries.forEach(function(name) {

          if (name.charAt(0) === '!') {
            name = name.substring(1);

            expect(entries).not.to.have.property(name);
          } else {
            expect(entries).to.have.property(name);
          }
        });
      });
    }


    it('should provide Stage entries', inject(function() {

      expectContextPadEntries('PI_Stage_1', [
        'replace',
        'connect',
        'append.entryCriterion',
        'append.text-annotation'
      ]);
    }));


    it('should provide Plan Fragment entries', inject(function() {

      expectContextPadEntries('DIS_PlanFragment_1', [
        'replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide blocking Task (plan item) entries', inject(function() {

      expectContextPadEntries('PI_Blocking_Task_1', [
        'replace',
        'connect',
        'append.entryCriterion',
        'append.text-annotation'
      ]);
    }));


    it('should provide non-blocking Task (plan item) entries', inject(function() {

      expectContextPadEntries('PI_Non_Blocking_Task_1', [
        'replace',
        'connect',
        'append.entryCriterion',
        'append.text-annotation'
      ]);
    }));


    it('should provide blocking Task (discretionary item) entries', inject(function() {

      expectContextPadEntries('DIS_Blocking_Task_2', [
        'replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide non-blocking Task (discretionary item) entries', inject(function() {

      expectContextPadEntries('DIS_Non_Blocking_Task_2', [
        'replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide blocking HumanTask (plan item) entries', inject(function() {

      expectContextPadEntries('PI_Blocking_HumanTask_1', [
        'replace',
        'connect',
        'append.entryCriterion',
        'append.discretionaryItem',
        'append.text-annotation'
      ]);
    }));


    it('should provide non-blocking HumanTask (plan item) entries', inject(function() {

      expectContextPadEntries('PI_Non_Blocking_HumanTask_1', [
        'replace',
        'connect',
        'append.entryCriterion',
        '!append.discretionaryItem',
        'append.text-annotation'
      ]);
    }));


    it('should provide blocking HumanTask (discretionary item) entries', inject(function() {

      expectContextPadEntries('DIS_Blocking_HumanTask_2', [
        'replace',
        'connect',
        '!append.entryCriterion',
        'append.discretionaryItem',
        'append.text-annotation'
      ]);
    }));


    it('should provide non-blocking HumanTask (discretionary item) entries', inject(function() {

      expectContextPadEntries('DIS_Non_Blocking_HumanTask_2', [
        'replace',
        'connect',
        '!append.entryCriterion',
        '!append.discretionaryItem',
        'append.text-annotation'
      ]);
    }));


    it('should provide Event Listener entries', inject(function() {

      expectContextPadEntries('PI_EventListener_1', [
        'replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide Milestone entries', inject(function() {

      expectContextPadEntries('PI_Milestone_1', [
        'replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide CasePlanModel entries', inject(function() {

      expectContextPadEntries('CasePlanModel_1', [
        'replace',
        '!connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide ExitCriterion attached to CasePlanModel entries', inject(function() {

      expectContextPadEntries('ExitCriterion_4', [
        '!replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide ExitCriterion attached to Stage entries', inject(function() {

      expectContextPadEntries('ExitCriterion_1', [
        'replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide EntryCriterion attached to Stage entries', inject(function() {

      expectContextPadEntries('EntryCriterion_1', [
        'replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide ExitCriterion attached to blocking Task (plan item) entries', inject(function() {

      expectContextPadEntries('ExitCriterion_2', [
        'replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide EntryCriterion attached to blocking Task (plan item) entries', inject(function() {

      expectContextPadEntries('EntryCriterion_2', [
        'replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide ExitCriterion attached to blocking Task (discretionary item) entries', inject(function() {

      expectContextPadEntries('ExitCriterion_3', [
        'replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide EntryCriterion attached to blocking Task (discretionary item) entries', inject(function() {

      expectContextPadEntries('EntryCriterion_5', [
        'replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide EntryCriterion attached to non-blocking Task (plan item) entries', inject(function() {

      expectContextPadEntries('EntryCriterion_3', [
        '!replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide EntryCriterion attached to non-blocking Task (discretionary item) entries', inject(function() {

      expectContextPadEntries('EntryCriterion_6', [
        '!replace',
        'connect',
        'append.text-annotation'
      ]);
    }));


    it('should provide EntryCriterion attached to milestone entries', inject(function() {

      expectContextPadEntries('EntryCriterion_4', [
        '!replace'
      ]);
    }));

  });

});


function padEntry(element, name) {
  return domQuery('[data-action="' + name + '"]', element);
}