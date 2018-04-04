'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */

var pick = require('min-dash').pick,
    assign = require('min-dash').assign;

var autoResizeModule = require('../../../../lib/features/auto-resize'),
    modelingModule = require('../../../../lib/features/modeling'),
    createModule = require('diagram-js/lib/features/create').default,
    coreModule = require('../../../../lib/core');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

function getBounds(shape) {
  return pick(shape, [ 'x', 'y', 'width', 'height' ]);
}


describe('features/auto-resize', function() {

  var testModules = [ coreModule, modelingModule, autoResizeModule, createModule ];

  var diagramXML = require('./auto-resize.cmmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  it('should expand stage', inject(
    function(elementRegistry, modeling) {

      // given
      var stagePI = elementRegistry.get('PI_Stage_1'),
          taskPI = elementRegistry.get('PI_Task_2');

      var originalBounds = getBounds(stagePI);

      // when
      modeling.moveElements([ taskPI ], { x: -150, y: 0 }, stagePI);

      // then
      var expectedBounds = assign(originalBounds, { x: 148, width: 482 });

      expect(stagePI).to.have.bounds(expectedBounds);
    }
  ));


  it('should expand case plan model', inject(
    function(elementRegistry, modeling, elementFactory) {

      // given
      var casePlanModelPI = elementRegistry.get('CasePlanModel_1'),
          taskPI = elementRegistry.get('PI_Task_1');

      var originalBounds = getBounds(casePlanModelPI);

      modeling.moveElements([ taskPI ], { x: -50, y: 0 }, casePlanModelPI);

      // then
      var expectedBounds = assign(originalBounds, { x: 0, width: 1052 });

      expect(casePlanModelPI).to.have.bounds(expectedBounds);
    }
  ));


  it('should expand plan fragment', inject(
    function(elementRegistry, modeling, elementFactory) {

      // given
      var PlanFragmentDI = elementRegistry.get('DI_PlanFragment_1'),
          taskPI = elementRegistry.get('PI_Task_1');

      var originalBounds = getBounds(PlanFragmentDI);

      modeling.moveElements([ taskPI ], { x: 600, y: 120 }, PlanFragmentDI);

      // then
      var expectedBounds = assign(originalBounds, { y: 153, height: 263 });

      expect(PlanFragmentDI).to.have.bounds(expectedBounds);
    }
  ));


  it('should not expand when creating criterions', inject(
    function(elementRegistry, elementFactory, dragging, create) {

      // given
      dragging.setOptions({ manual: true });

      var casePlanModel = elementRegistry.get('CasePlanModel_1'),
          casePlanModelGfx = elementRegistry.getGraphics(casePlanModel),
          originalBounds = getBounds(casePlanModel);

      var entryCriterion = elementFactory.createCriterionShape('cmmn:EntryCriterion');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), entryCriterion);

      dragging.hover({ element: casePlanModel, gfx: casePlanModelGfx });
      dragging.move(canvasEvent({ x: 200, y: 434 }));
      dragging.end();

      dragging.setOptions({ manual: false });

      // then
      // expect the case plan model not to auto expand
      expect(casePlanModel).to.have.bounds(originalBounds);
    }
  ));


  it('should expand when moving task with attached criterion', inject(
    function(elementRegistry, modeling, dragging, create) {

      var stagePI = elementRegistry.get('PI_Stage_1'),
          taskPI = elementRegistry.get('PI_Task_3');

      var originalBounds = getBounds(stagePI);

      // when
      modeling.moveElements([ taskPI ], { x: 100, y: 80 }, stagePI);

      // then
      var expectedBounds = assign(originalBounds, { y: 113, height: 303 });

      expect(stagePI).to.have.bounds(expectedBounds);
    }
  ));

});
