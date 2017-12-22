'use strict';

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');

var ATTACH = {
  attach: true
};


describe('features/modeling - update attachment', function() {

  var diagramXML = require('./UpdateAttachment.cmmn');

  var testModules = [
    coreModule,
    modelingModule
  ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  var rootElement;

  beforeEach(inject(function(canvas) {
    rootElement = canvas.getRootElement();
  }));

  describe('create', function() {

    var criterionShape, criterion, host;

    describe('exit criterion', function() {

      beforeEach(inject(function(elementFactory) {
        criterionShape = elementFactory.createCriterionShape('cmmn:ExitCriterion');
        criterion = criterionShape.businessObject;
      }));

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var hostShape = elementRegistry.get('PI_Stage_1');
        host = hostShape.businessObject;

        // when
        modeling.createShape(criterionShape, { x: 296, y: 210 }, hostShape, ATTACH);
      }));

      it('should execute', function() {
        // then
        expect(host.exitCriteria).to.include(criterion);
        expect(criterion.$parent).to.equal(host);
        expect(rootElement.businessObject.diagramElements).to.contain(criterion.di);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(host.exitCriteria).not.to.include(criterion);
        expect(criterion.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.contain(criterion.di);
      }));

      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(host.exitCriteria).to.include(criterion);
        expect(criterion.$parent).to.equal(host);
        expect(rootElement.businessObject.diagramElements).to.contain(criterion.di);
      }));

    });


    describe('entry criterion', function() {

      beforeEach(inject(function(elementFactory) {
        criterionShape = elementFactory.createCriterionShape('cmmn:EntryCriterion');
        criterion = criterionShape.businessObject;
      }));

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var hostShape = elementRegistry.get('PI_Stage_1');
        host = hostShape.businessObject;

        // when
        modeling.createShape(criterionShape, { x: 296, y: 210 }, hostShape, ATTACH);
      }));

      it('should execute', function() {
        // then
        expect(host.entryCriteria).to.include(criterion);
        expect(criterion.$parent).to.equal(host);
        expect(rootElement.businessObject.diagramElements).to.contain(criterion.di);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(host.entryCriteria).not.to.include(criterion);
        expect(criterion.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.contain(criterion.di);
      }));

      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(host.entryCriteria).to.include(criterion);
        expect(criterion.$parent).to.equal(host);
        expect(rootElement.businessObject.diagramElements).to.contain(criterion.di);
      }));

    });

  });


  describe('reattach', function() {

    var criterionShape, criterion, newHost, oldHost;

    describe('exit criterion', function() {

      beforeEach(inject(function(elementRegistry) {
        criterionShape = elementRegistry.get('ExitCriterion_1');
        criterion = criterionShape.businessObject;
        oldHost = criterion.$parent;
      }));

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var newHostShape = elementRegistry.get('PI_Stage_1');
        newHost = newHostShape.businessObject;

        // when
        modeling.moveElements([ criterionShape ], { x: 129, y: 0 }, newHostShape, ATTACH);

      }));

      it('should execute', function() {
        // then
        expect(oldHost.exitCriteria).not.to.include(criterion);
        expect(newHost.exitCriteria).to.include(criterion);
        expect(criterion.$parent).to.equal(newHost);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldHost.exitCriteria).to.include(criterion);
        expect(newHost.exitCriteria).not.to.include(criterion);
        expect(criterion.$parent).to.equal(oldHost);
      }));

      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldHost.exitCriteria).not.to.include(criterion);
        expect(newHost.exitCriteria).to.include(criterion);
        expect(criterion.$parent).to.equal(newHost);
      }));

    });


    describe('entry criterion', function() {

      beforeEach(inject(function(elementRegistry) {
        criterionShape = elementRegistry.get('EntryCriterion_1');
        criterion = criterionShape.businessObject;
        oldHost = criterion.$parent;
      }));

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var newHostShape = elementRegistry.get('PI_Stage_1');
        newHost = newHostShape.businessObject;

        // when
        modeling.moveElements([ criterionShape ], { x: -122, y: 0 }, newHostShape, ATTACH);

      }));

      it('should execute', function() {
        // then
        expect(oldHost.entryCriteria).not.to.include(criterion);
        expect(newHost.entryCriteria).to.include(criterion);
        expect(criterion.$parent).to.equal(newHost);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldHost.entryCriteria).to.include(criterion);
        expect(newHost.entryCriteria).not.to.include(criterion);
        expect(criterion.$parent).to.equal(oldHost);
      }));

      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldHost.entryCriteria).not.to.include(criterion);
        expect(newHost.entryCriteria).to.include(criterion);
        expect(criterion.$parent).to.equal(newHost);
      }));

    });

  });


  describe('delete', function() {

    var criterionShape, criterion, oldHost;

    describe('exit criterion', function() {

      beforeEach(inject(function(elementRegistry) {
        criterionShape = elementRegistry.get('ExitCriterion_1');
        criterion = criterionShape.businessObject;
        oldHost = criterion.$parent;
      }));

      beforeEach(inject(function(modeling, elementRegistry) {

        // when
        modeling.removeElements([ criterionShape ]);

      }));

      it('should execute', function() {
        // then
        expect(oldHost.exitCriteria).not.to.include(criterion);
        expect(criterion.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.contain(criterion.di);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldHost.exitCriteria).to.include(criterion);
        expect(criterion.$parent).to.equal(oldHost);
        expect(rootElement.businessObject.diagramElements).to.contain(criterion.di);
      }));

      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldHost.exitCriteria).not.to.include(criterion);
        expect(criterion.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.contain(criterion.di);
      }));

    });


    describe('entry criterion', function() {

      beforeEach(inject(function(elementRegistry) {
        criterionShape = elementRegistry.get('EntryCriterion_1');
        criterion = criterionShape.businessObject;
        oldHost = criterion.$parent;
      }));

      beforeEach(inject(function(modeling, elementRegistry) {

        // when
        modeling.removeElements([ criterionShape ]);

      }));

      it('should execute', function() {
        // then
        expect(oldHost.entryCriteria).not.to.include(criterion);
        expect(criterion.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.contain(criterion.di);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldHost.entryCriteria).to.include(criterion);
        expect(criterion.$parent).to.equal(oldHost);
        expect(rootElement.businessObject.diagramElements).to.contain(criterion.di);
      }));

      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldHost.entryCriteria).not.to.include(criterion);
        expect(criterion.$parent).not.to.exist;
        expect(rootElement.businessObject.diagramElements).not.to.contain(criterion.di);
      }));

    });

  });

});
