'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

var coreModule = require('../../../../lib/core'),
    snappingModule = require('../../../../lib/features/snapping'),
    modelingModule = require('../../../../lib/features/modeling'),
    resizeModule = require('diagram-js/lib/features/resize'),
    rulesModule = require('../../../../lib/features/rules');


describe('features/snapping - CmmnSnapping', function() {

  var testModules = [
    coreModule,
    modelingModule,
    resizeModule,
    rulesModule,
    snappingModule
  ];

  describe('on CasePlanModel resize', function () {

    describe('snap min bounds', function() {

      var diagramXML = require('./CmmnSnapping.caseplanmodel-resize.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should snap to children from <se>', inject(function(elementRegistry, resize, dragging) {

        // given
        var casePlanModel = elementRegistry.get('CasePlanModel_1');

        // when
        resize.activate(canvasEvent({ x: 500, y: 500 }), casePlanModel, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        // then
        expect(casePlanModel.width).to.equal(192);
        expect(casePlanModel.height).to.equal(171);
      }));


      it('should snap to children from <nw>', inject(function(elementRegistry, resize, dragging) {

        // given
        var casePlanModel = elementRegistry.get('CasePlanModel_1');

        // when
        resize.activate(canvasEvent({ x: 0, y: 0 }), casePlanModel, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        // then
        expect(casePlanModel.width).to.equal(345);
        expect(casePlanModel.height).to.equal(195);
      }));


      it('should snap to min dimensions from <se>', inject(function(elementRegistry, resize, dragging) {

        // given
        var casePlanModel = elementRegistry.get('CasePlanModel_2');

        // when
        resize.activate(canvasEvent({ x: 500, y: 500 }), casePlanModel, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        // then
        expect(casePlanModel.width).to.equal(140);
        expect(casePlanModel.height).to.equal(120);
      }));


      it('should snap to min dimensions from <nw>', inject(function(elementRegistry, resize, dragging) {

        // given
        var casePlanModel = elementRegistry.get('CasePlanModel_2');

        // when
        resize.activate(canvasEvent({ x: 0, y: 0 }), casePlanModel, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        // then
        expect(casePlanModel.width).to.equal(140);
        expect(casePlanModel.height).to.equal(120);
      }));

    });

  });


  describe('on plan item stage resize', function() {

    describe('snap min bounds', function() {
      
      var diagramXML = require('./CmmnSnapping.planitem-stage-resize.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should snap to children from <se>', inject(function(elementRegistry, resize, dragging) {

        // given
        var stage = elementRegistry.get('PI_Stage_1');

        // when
        resize.activate(canvasEvent({ x: 500, y: 500 }), stage, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        // then
        expect(stage.width).to.equal(177);
        expect(stage.height).to.equal(156);
      }));


      it('should snap to children from <nw>', inject(function(elementRegistry, resize, dragging) {

        // given
        var stage = elementRegistry.get('PI_Stage_1');

        // when
        resize.activate(canvasEvent({ x: 0, y: 0 }), stage, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        // then
        expect(stage.width).to.equal(310);
        expect(stage.height).to.equal(160);
      }));


      it('should snap to min dimensions from <se>', inject(function(elementRegistry, resize, dragging) {

        // given
        var stage = elementRegistry.get('PI_Stage_2');

        // when
        resize.activate(canvasEvent({ x: 500, y: 500 }), stage, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        // then
        expect(stage.width).to.equal(140);
        expect(stage.height).to.equal(120);
      }));


      it('should snap to min dimensions from <nw>', inject(function(elementRegistry, resize, dragging) {

        // given
        var stage = elementRegistry.get('PI_Stage_2');

        // when
        resize.activate(canvasEvent({ x: 0, y: 0 }), stage, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        // then
        expect(stage.width).to.equal(140);
        expect(stage.height).to.equal(120);
      }));

    });

  });


  describe('on discretionary item stage resize', function() {

    describe('snap min bounds', function() {
      
      var diagramXML = require('./CmmnSnapping.discretionaryitem-stage-resize.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should snap to children from <se>', inject(function(elementRegistry, resize, dragging) {

        // given
        var stage = elementRegistry.get('DIS_Stage_1');

        // when
        resize.activate(canvasEvent({ x: 500, y: 500 }), stage, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        // then
        expect(stage.width).to.equal(177);
        expect(stage.height).to.equal(156);
      }));


      it('should snap to children from <nw>', inject(function(elementRegistry, resize, dragging) {

        // given
        var stage = elementRegistry.get('DIS_Stage_1');

        // when
        resize.activate(canvasEvent({ x: 0, y: 0 }), stage, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        // then
        expect(stage.width).to.equal(310);
        expect(stage.height).to.equal(160);
      }));


      it('should snap to min dimensions from <se>', inject(function(elementRegistry, resize, dragging) {

        // given
        var stage = elementRegistry.get('DIS_Stage_2');

        // when
        resize.activate(canvasEvent({ x: 500, y: 500 }), stage, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        // then
        expect(stage.width).to.equal(140);
        expect(stage.height).to.equal(120);
      }));


      it('should snap to min dimensions from <nw>', inject(function(elementRegistry, resize, dragging) {

        // given
        var stage = elementRegistry.get('DIS_Stage_2');

        // when
        resize.activate(canvasEvent({ x: 0, y: 0 }), stage, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        // then
        expect(stage.width).to.equal(140);
        expect(stage.height).to.equal(120);
      }));

    });

  });

  describe('on TextAnnotation resize', function() {

    var diagramXML = require('./CmmnSnapping.text-annotation.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    it('should snap to minimum bounds', inject(function(elementRegistry, resize, dragging) {

      var textAnnotation = elementRegistry.get('TextAnnotation_1');

      resize.activate(canvasEvent({ x: 0, y: 0 }), textAnnotation, 'se');
      dragging.move(canvasEvent({ x: -400, y: -400 }));
      dragging.end();

      expect(textAnnotation.width).to.equal(50);
      expect(textAnnotation.height).to.equal(30);
    }));

  });

});
