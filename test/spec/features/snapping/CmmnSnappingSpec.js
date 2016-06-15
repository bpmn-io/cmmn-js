'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

var coreModule = require('../../../../lib/core'),
    snappingModule = require('../../../../lib/features/snapping'),
    modelingModule = require('../../../../lib/features/modeling'),
    resizeModule = require('diagram-js/lib/features/resize'),
    createModule = require('diagram-js/lib/features/create'),
    rulesModule = require('../../../../lib/features/rules');


describe('features/snapping - CmmnSnapping', function() {

  var testModules = [
    coreModule,
    modelingModule,
    resizeModule,
    rulesModule,
    snappingModule,
    createModule
  ];

  describe('on CasePlanModel resize', function() {

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


  describe('Sentries', function() {

    var diagramXML = require('./CmmnSnapping.sentries.cmmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    var entryCriterion;

    beforeEach(inject(function(elementFactory, elementRegistry, dragging) {

      entryCriterion = elementFactory.createCriterionShape('cmmn:EntryCriterion');

      dragging.setOptions({ manual: true });
    }));

    afterEach(inject(function(dragging) {
      dragging.setOptions({ manual: false });
    }));


    it('should snap to case plan model edge', inject(function(canvas, create, dragging, elementRegistry) {

      // given
      var casePlanModel = elementRegistry.get('CasePlanModel_1'),
          casePlanModelGfx = canvas.getGraphics(casePlanModel);

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), entryCriterion);

      dragging.hover({ element: casePlanModel, gfx: casePlanModelGfx });

      dragging.move(canvasEvent({ x: 100, y: 150 }));
      dragging.end();

      var sentry = elementRegistry.get(casePlanModel.attachers[0].id);

      // then
      expect(sentry).to.have.bounds({ x: 100, y: 136, width: 20, height: 28 });
    }));


    it('should snap to case plan model corner', inject(function(canvas, create, dragging, elementRegistry) {

      // given
      var casePlanModel = elementRegistry.get('CasePlanModel_1'),
          casePlanModelGfx = canvas.getGraphics(casePlanModel);

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), entryCriterion);

      dragging.hover({ element: casePlanModel, gfx: casePlanModelGfx });

      dragging.move(canvasEvent({ x: 100, y: 55 }));
      dragging.end();

      var sentry = elementRegistry.get(casePlanModel.attachers[0].id);

      // then
      expect(sentry).to.have.bounds({ x: 100, y: 41, width: 20, height: 28 });
    }));


    it('should snap to task edge', inject(function(canvas, create, dragging, elementRegistry) {

      // given
      var taskPI = elementRegistry.get('PI_Task_1'),
          taskGfx = canvas.getGraphics(taskPI);

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), entryCriterion);

      dragging.hover({ element: taskPI, gfx: taskGfx });

      dragging.move(canvasEvent({ x: 280, y: 170 }));
      dragging.end();

      var sentry = elementRegistry.get(taskPI.attachers[0].id);

      // then
      expect(sentry).to.have.bounds({ x: 262, y: 156, width: 20, height: 28 });
    }));


    it('should snap to task corner', inject(function(canvas, create, dragging, elementRegistry) {
      // given
      var taskPI = elementRegistry.get('PI_Task_1'),
          taskGfx = canvas.getGraphics(taskPI);

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), entryCriterion);

      dragging.hover({ element: taskPI, gfx: taskGfx });

      dragging.move(canvasEvent({ x: 280, y: 130 }));
      dragging.end();

      var sentry = elementRegistry.get(taskPI.attachers[0].id);

      // then
      expect(sentry).to.have.bounds({ x: 262, y: 113, width: 20, height: 28 });
    }));


    it('should snap to stage edge', inject(function(canvas, create, dragging, elementRegistry) {
      // given
      var stagePI = elementRegistry.get('PI_Stage_1'),
          stageGfx = canvas.getGraphics(stagePI);

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), entryCriterion);

      dragging.hover({ element: stagePI, gfx: stageGfx });

      dragging.move(canvasEvent({ x: 120, y: 200 }));
      dragging.end();

      var sentry = elementRegistry.get(stagePI.attachers[0].id);

      // then
      expect(sentry).to.have.bounds({ x: 120, y: 186, width: 20, height: 28 });
    }));


    it('should not snap to stage corner', inject(function(canvas, create, dragging, elementRegistry) {
      // given
      var stagePI = elementRegistry.get('PI_Stage_1'),
          stageGfx = canvas.getGraphics(stagePI);

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), entryCriterion);

      dragging.hover({ element: stagePI, gfx: stageGfx });

      dragging.move(canvasEvent({ x: 120, y: 75 }));
      dragging.end();

      var sentry = elementRegistry.get(stagePI.attachers[0].id);

      // then
      expect(sentry).to.have.bounds({ x: 110, y: 61, width: 20, height: 28 });
    }));


    it('should snap to milestone edge', inject(function(canvas, create, dragging, elementRegistry) {
      // given
      var milestonePI = elementRegistry.get('PI_Milestone_1'),
          milestoneGfx = canvas.getGraphics(milestonePI);

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), entryCriterion);

      dragging.hover({ element: milestonePI, gfx: milestoneGfx });

      dragging.move(canvasEvent({ x: 309, y: 160 }));
      dragging.end();

      var sentry = elementRegistry.get(milestonePI.attachers[0].id);

      // then
      expect(sentry).to.have.bounds({ x: 309, y: 146, width: 20, height: 28 });
    }));


    it('should not snap to milestone corner', inject(function(canvas, create, dragging, elementRegistry) {
      // given
      var milestonePI = elementRegistry.get('PI_Milestone_1'),
          milestoneGfx = canvas.getGraphics(milestonePI);

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), entryCriterion);

      dragging.hover({ element: milestonePI, gfx: milestoneGfx });

      dragging.move(canvasEvent({ x: 319, y: 148 }));
      dragging.end();

      var sentry = elementRegistry.get(milestonePI.attachers[0].id);

      // then
      expect(sentry).to.have.bounds({ x: 309, y: 134, width: 20, height: 28 });
    }));

  });

});
