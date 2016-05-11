'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

var domQuery = require('min-dom/lib/query');

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


  describe('remove action rules', function () {

    var diagramXML = require('../../../fixtures/cmmn/simple.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    var deleteAction;

    beforeEach(inject(function (contextPad) {

      deleteAction = function(element) {
        return padEntry(contextPad.getPad(element).html, 'delete');
      };
    }));


    it('should add delete action by default', inject(function (elementRegistry, contextPad) {

      // given
      var element = elementRegistry.get('PI_Task_1');

      // when
      contextPad.open(element);

      // then
      expect(deleteAction(element)).to.exist;
    }));


    it('should include delete action when rule returns true',
      inject(function (elementRegistry, contextPad, customRules) {

      // given
      customRules.addRule('elements.delete', function() {
        return true;
      });

      var element = elementRegistry.get('PI_Task_1');

      // when
      contextPad.open(element);

      // then
      expect(deleteAction(element)).to.exist;
    }));


    it('should NOT include delete action when rule returns false',
      inject(function(elementRegistry, contextPad, customRules) {

      // given
      customRules.addRule('elements.delete', function() {
        return false;
      });

      var element = elementRegistry.get('PI_Task_1');

      // when
      contextPad.open(element);

      // then
      expect(deleteAction(element)).to.not.exist;
    }));


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
    }));


    it('should NOT include delete action when [ ] is returned from rule',
      inject(function(elementRegistry, contextPad, customRules) {

      // given
      customRules.addRule('elements.delete', function() {
        return [];
      });

      var element = elementRegistry.get('PI_Task_1');

      // when
      contextPad.open(element);

      // then
      expect(deleteAction(element)).to.not.exist;
    }));

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
        preventDefault: function(){}
      };

      // when
      contextPad.trigger('click', event);
      replaceMenuRect = domQuery('.cmmn-replace', container).getBoundingClientRect();

      // then
      expect(replaceMenuRect.left).to.be.at.most(padMenuRect.left);
      expect(replaceMenuRect.top).to.be.at.most(padMenuRect.bottom + padding);
    }));

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
        'replace'
      ]);
    }));


    it('should provide Plan Fragment entries', inject(function() {

      expectContextPadEntries('DIS_PlanFragment_1', [
        '!replace'
      ]);
    }));


    it('should provide blocking Task (plan item) entries', inject(function() {

      expectContextPadEntries('PI_Blocking_Task_1', [
        'replace'
      ]);
    }));


    it('should provide non-blocking Task (plan item) entries', inject(function() {

      expectContextPadEntries('PI_Non_Blocking_Task_1', [
        'replace'
      ]);
    }));


    it('should provide blocking Task (discretionary item) entries', inject(function() {

      expectContextPadEntries('DIS_Blocking_Task_2', [
        'replace'
      ]);
    }));


    it('should provide non-blocking Task (discretionary item) entries', inject(function() {

      expectContextPadEntries('DIS_Non_Blocking_Task_2', [
        'replace'
      ]);
    }));


    it('should provide Milestone entries', inject(function() {

      expectContextPadEntries('PI_Milestone_1', [
        'replace'
      ]);
    }));


    it('should provide CasePlanModel entries', inject(function() {

      expectContextPadEntries('CasePlanModel_1', [
        'replace'
      ]);
    }));

  });

});


function padEntry(element, name) {
  return domQuery('[data-action="' + name + '"]', element);
}