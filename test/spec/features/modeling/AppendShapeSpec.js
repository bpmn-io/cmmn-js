'use strict';

/* global bootstrapModeler, inject */

var find = require('lodash/collection/find');


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - append shape', function() {

  var diagramXML = require('../../../fixtures/cmmn/simple.cmmn');

  var testModules = [ coreModule, modelingModule ];
  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  describe('text annotation', function() {

    var source, textAnnotationShape, textAnnotation, definitions;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      source = elementRegistry.get('PI_Task_1');
      definitions = elementRegistry.get('CasePlanModel_1').businessObject.$parent.$parent;

      // when
      textAnnotationShape = modeling.appendShape(source, { type: 'cmmn:TextAnnotation' }, { x: 400, y: 150 });
      textAnnotation = textAnnotationShape.businessObject;

    }));


    describe('should create shape', function() {

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(textAnnotationShape).to.exist;
        expect(elementRegistry.get(textAnnotationShape.id)).to.exist;

        expect(textAnnotation).to.exist;
        expect(textAnnotation.$type).to.equal('cmmn:TextAnnotation');
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(textAnnotationShape.id)).not.to.exist;
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(textAnnotationShape).to.exist;
        expect(elementRegistry.get(textAnnotationShape.id)).to.exist;

        expect(textAnnotation).to.exist;
        expect(textAnnotation.$type).to.equal('cmmn:TextAnnotation');
      }));

    });


    describe('should add to parent (definitions)', function() {

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(textAnnotation.$parent).to.equal(definitions);
        expect(definitions.get('artifacts')).to.include(textAnnotation);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(textAnnotation.$parent).not.to.exist;
        expect(definitions.get('artifacts')).not.to.include(textAnnotation);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(textAnnotation.$parent).to.equal(definitions);
        expect(definitions.get('artifacts')).to.include(textAnnotation);
      }));

    });


    describe('should create DI', function() {

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(textAnnotation.di).to.exist;
        expect(textAnnotation.di.$parent).to.equal(source.businessObject.di.$parent);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(textAnnotation.di).to.exist;
        expect(textAnnotation.di.$parent).not.to.exist;
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(textAnnotation.di).to.exist;
        expect(textAnnotation.di.$parent).to.eql(source.businessObject.di.$parent);
      }));

    });


    describe('should add connection', function() {

      var connection;

      beforeEach(function() {

        connection = find(definitions.get('artifacts'), function(e) {
          return e.sourceRef === source.businessObject && e.targetRef === textAnnotation;
        });

      });

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(connection).to.exist;
        expect(connection.$type).to.equal('cmmn:Association');
        expect(connection.$parent).to.equal(definitions);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(connection).to.exist;
        expect(connection.$type).to.equal('cmmn:Association');
        expect(connection.$parent).not.to.exist;
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connection).to.exist;
        expect(connection.$type).to.equal('cmmn:Association');
        expect(connection.$parent).to.equal(definitions);
      }));

    });

  });

});
