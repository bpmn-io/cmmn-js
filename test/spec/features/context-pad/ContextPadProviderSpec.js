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

});


function padEntry(element, name) {
  return domQuery('[data-action="' + name + '"]', element);
}