'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');

var ATTACH = {
  attach: true
};


describe('features/behavior - AttachCriterionBehavior', function() {

  var testModules = [ modelingModule, coreModule ];

  var testXML = require('./AttachCriterionBehavior.cmmn');

  beforeEach(bootstrapModeler(testXML, { modules: testModules }));

  var criterion, casePlanModel;

  beforeEach(inject(function(elementFactory) {
    criterion = elementFactory.createCriterionShape('cmmn:ExitCriterion');
  }));


  describe('create', function() {


    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      casePlanModel = elementRegistry.get('CasePlanModel_1');

      // when
      modeling.createShape(criterion, { x: 87, y: 60 }, casePlanModel, ATTACH);
    }));


    it('should execute', function() {
      expect(casePlanModel.children).to.include(criterion);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(casePlanModel.children).not.to.include(criterion);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(casePlanModel.children).to.include(criterion);
    }));

  });


  describe('move', function() {


    describe('should add exit criterion to case plan model', function() {

      beforeEach(inject(function(modeling, elementRegistry, itemRegistry) {

        // given
        casePlanModel = elementRegistry.get('CasePlanModel_1');
        criterion = elementRegistry.get('ExitCriterion_2');

        // when
        modeling.moveElements([ criterion ], { x: -268, y: 50 }, casePlanModel, ATTACH);

      }));


      it('should execute', function() {
        expect(casePlanModel.children).to.include(criterion);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(casePlanModel.children).not.to.include(criterion);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(casePlanModel.children).to.include(criterion);
      }));

    });


    describe('should add replaced criterion to case plan model', function() {

      var sentry, newCriterion;

      beforeEach(inject(function(modeling, elementRegistry, itemRegistry) {

        // given
        casePlanModel = elementRegistry.get('CasePlanModel_1');
        criterion = elementRegistry.get('EntryCriterion_1');
        sentry = criterion.businessObject.sentryRef;

        // when
        modeling.moveElements([ criterion ], { x: -168, y: 50 }, casePlanModel, ATTACH);

        newCriterion = itemRegistry.getShapes(itemRegistry.getReferences(sentry))[0];

      }));


      it('should execute', function() {
        expect(casePlanModel.children).to.include(newCriterion);
        expect(casePlanModel.children).not.to.include(criterion);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(casePlanModel.children).not.to.include(newCriterion);
        expect(casePlanModel.children).not.to.include(criterion);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(casePlanModel.children).to.include(newCriterion);
        expect(casePlanModel.children).not.to.include(criterion);
      }));

    });


    describe('should be kept as children from case plan model', function() {

      beforeEach(inject(function(modeling, elementRegistry, itemRegistry) {

        // given
        casePlanModel = elementRegistry.get('CasePlanModel_1');
        criterion = elementRegistry.get('ExitCriterion_1');

        // when
        modeling.moveElements([ criterion ], { x: -0, y: 50 }, casePlanModel, ATTACH);

      }));


      it('should execute', function() {
        expect(casePlanModel.children).to.include(criterion);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(casePlanModel.children).to.include(criterion);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(casePlanModel.children).to.include(criterion);
      }));

    });

  });

});
