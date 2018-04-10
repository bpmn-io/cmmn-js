'use strict';

/* global bootstrapModeler, inject */

var replacePreviewModule = require('../../../../lib/features/replace-preview'),
    modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

var assign = require('min-dash').assign;

var domQuery = require('min-dom').query;

var innerSVG = require('tiny-svg').innerSVG,
    svgAttr = require('tiny-svg').attr,
    svgClone = require('tiny-svg').clone;


describe('features/replace-preview', function() {

  var testModules = [ replacePreviewModule, modelingModule, coreModule ];

  var diagramXML = require('./CmmnReplacePreview.cmmn');

  var exitCriterion,
      milestone;

  var getGfx,
      getInnerHTML,
      moveShape;

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  beforeEach(inject(function(canvas, elementRegistry, elementFactory, move, dragging) {

    exitCriterion = elementRegistry.get('ExitCriterion_.1');
    milestone = elementRegistry.get('PI_Milestone._1');

    /**
     * returns the gfx representation of an element type
     *
     * @param  {Object} elementData
     *
     * @return {Object}
     */
    getGfx = function(elementData) {
      assign(elementData, { x: 0, y: 0 });

      var tempShape = elementFactory.createShape(elementData);

      canvas.addShape(tempShape, milestone);

      var gfx = svgClone(elementRegistry.getGraphics(tempShape));

      canvas.removeShape(tempShape);

      return gfx;
    };


    getInnerHTML = function(element) {
      return domQuery('.djs-visual', element).innerHTML;
    };


    moveShape = function(shape, target, position) {
      var startPosition = { x: shape.x + 10 + (shape.width / 2), y: shape.y + 30 + (shape.height / 2) };

      move.start(canvasEvent(startPosition), shape);

      dragging.hover({
        element: target,
        gfx: elementRegistry.getGraphics(target)
      });

      dragging.move(canvasEvent(position));
    };

  }));

  it('should replace visuals at the same position as the replaced visual', inject(function(dragging, elementRegistry) {

    // when
    moveShape(exitCriterion, milestone, { x: 244, y: 273 });

    // then
    var dragGroup = dragging.context().data.context.dragGroup;

    expect(dragGroup.childNodes[0]).to.exist;
    expect(dragGroup.childNodes[1]).not.to.exist;

    var criterionInnerGfx = getGfx({
      type: 'cmmn:EntryCriterion'
    });

    expect(getInnerHTML(dragGroup.childNodes[0])).to.equal(getInnerHTML(criterionInnerGfx));

  }));


  it('should add dragger to context.visualReplacements once', inject(function(dragging) {

    // when
    moveShape(exitCriterion, milestone, { x: 244, y: 273 });
    moveShape(exitCriterion, milestone, { x: 245, y: 273 });

    // then
    var visualReplacements = dragging.context().data.context.visualReplacements;

    expect(visualReplacements[exitCriterion.id]).to.exist;
    expect(Object.keys(visualReplacements).length).to.equal(1);

  }));


  it('should remove dragger from context.visualReplacements', inject(function(elementRegistry, dragging) {

    // given
    var subProcess_2 = elementRegistry.get('CasePlanModel_1');

    // when
    moveShape(exitCriterion, milestone, { x: 244, y: 273 });
    moveShape(exitCriterion, subProcess_2, { x: 170, y: 273 });

    // then
    var visualReplacements = dragging.context().data.context.visualReplacements;

    expect(visualReplacements).to.be.empty;

  }));


  it('should not hide the replaced visual', inject(function(dragging) {

    // when
    moveShape(exitCriterion, milestone, { x: 244, y: 273 });

    // then
    var dragGroup = dragging.context().data.context.dragGroup;

    expect(svgAttr(dragGroup.childNodes[0], 'display')).not.to.equal('none');

  }));


  it('should not replace hover over task',
    inject(function(dragging, elementRegistry) {

      // given
      var task = elementRegistry.get('PI_Task_1');

      // when
      moveShape(exitCriterion, task, { x: 244, y: 180 });

      var context = dragging.context().data.context;

      // then
      var criterionInnerGfx = getGfx({
        type: 'cmmn:ExitCriterion'
      });

      expect(innerSVG(context.dragGroup.childNodes[0])).to.equal(innerSVG(criterionInnerGfx));

    })
  );


  it('should not replace while hover over root element',
    inject(function(dragging, canvas) {

      // when
      moveShape(exitCriterion, canvas.getRootElement(), { x: 100, y: 100 });

      var context = dragging.context().data.context;

      // then
      var criterionInnerGfx = getGfx({ type: 'cmmn:ExitCriterion' });

      expect(innerSVG(context.dragGroup.childNodes[0])).to.equal(innerSVG(criterionInnerGfx));

    })
  );


  it('should replace discretionary task while hover over plan fragment',
    inject(function(dragging, canvas, elementRegistry) {

      // given
      var item = elementRegistry.get('DIS_Task_2');
      var target = elementRegistry.get('DIS_PlanFragment_1');

      // when
      moveShape(item, target, { x: 510, y: 400 });

      var dragGroup = dragging.context().data.context.dragGroup;

      // then
      var gfx = getGfx({
        type: 'cmmn:PlanItem',
        definitionType: 'cmmn:Task'
      });

      expect(getInnerHTML(dragGroup.childNodes[0])).to.equal(getInnerHTML(gfx));

    })
  );


  it('should replace discretionary plan fragment while hover over plan fragment',
    inject(function(dragging, canvas, elementRegistry) {

      // given
      var item = elementRegistry.get('DIS_PlanFragment_2');
      var target = elementRegistry.get('DIS_PlanFragment_1');

      // when
      moveShape(item, target, { x: 510, y: 400 });

      var dragGroup = dragging.context().data.context.dragGroup;

      // then
      var gfx = getGfx({
        type: 'cmmn:PlanItem',
        definitionType: 'cmmn:Stage',
        width: item.width,
        height: item.height
      });

      expect(getInnerHTML(dragGroup.childNodes[0])).to.equal(getInnerHTML(gfx));

    })
  );


  it('should replace discretionary stage while hover over plan fragment',
    inject(function(dragging, canvas, elementRegistry) {

      // given
      var item = elementRegistry.get('DIS_Stage_1');
      var target = elementRegistry.get('DIS_PlanFragment_1');

      // when
      moveShape(item, target, { x: 510, y: 400 });

      var dragGroup = dragging.context().data.context.dragGroup;

      // then
      var gfx = getGfx({
        type: 'cmmn:PlanItem',
        definitionType: 'cmmn:Stage',
        width: item.width,
        height: item.height
      });

      expect(getInnerHTML(dragGroup.childNodes[0])).to.equal(getInnerHTML(gfx));

    })
  );

});
