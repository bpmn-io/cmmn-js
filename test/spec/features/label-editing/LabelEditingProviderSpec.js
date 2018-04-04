'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapViewer, inject */

TestHelper.insertCSS('diagram-js-label-editing.css',
  'div { box-sizing: border-box; }' +
  'div[contenteditable=true] { line-height: 14px; font-family: Arial; font-size: 12px }'
);

var labelEditingModule = require('../../../../lib/features/label-editing'),
    modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core'),
    draggingModule = require('diagram-js/lib/features/dragging').default;

var LabelUtil = require('../../../../lib/features/label-editing/LabelUtil');

var domQuery = require('min-dom').query;


function triggerKeyEvent(element, event, code) {
  var e = document.createEvent('Events');

  if (e.initEvent) {
    e.initEvent(event, true, true);
  }

  e.keyCode = code;
  e.which = code;

  return element.dispatchEvent(e);
}


function getBBox(directEditing) {
  var el = directEditing._textbox.parent;

  return el.getBoundingClientRect();
}


describe('features - label-editing', function() {

  var diagramXML = require('./labels.cmmn');

  var testModules = [ labelEditingModule, coreModule, draggingModule, modelingModule ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));

  var setText;

  beforeEach(inject(function(eventBus, directEditing, elementRegistry) {

    setText = function(shape, value) {
      eventBus.fire('element.dblclick', { element: shape });

      directEditing._textbox.content.innerText = value;
      directEditing.complete();
    };

  }));

  describe('basics', function() {

    it('should register on dblclick', inject(function(elementRegistry, directEditing, eventBus) {

      // given
      var shape = elementRegistry.get('PI_HumanTask_1');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      expect(directEditing.isActive()).to.be.true;
    }));


    it('should cancel on <ESC>', inject(function(elementRegistry, directEditing, eventBus) {

      // given
      var shape = elementRegistry.get('PI_HumanTask_1'),
          task = shape.businessObject;

      var oldName = task.name;

      // activate
      eventBus.fire('element.dblclick', { element: shape });

      // a <textarea /> element
      var content = directEditing._textbox.content;

      // when
      // change + ESC is pressed
      content.innerText = 'new value';
      triggerKeyEvent(content, 'keydown', 27);

      // then
      expect(directEditing.isActive()).to.be.false;
      expect(task.name).to.equal(oldName);
    }));


    it('should complete on drag start', inject(function(elementRegistry, directEditing, dragging) {

      // given
      var shape = elementRegistry.get('PI_HumanTask_1'),
          task = shape.businessObject;

      directEditing.activate(shape);

      directEditing._textbox.content.innerText = 'FOO BAR';

      // when
      dragging.init(null, { x: 0, y: 0 }, 'foo');

      // then
      expect(task.name).to.equal('FOO BAR');
    }));

  });


  describe('elements', function() {

    it('should edit CasePlanModel', inject(function(elementRegistry) {

      // given
      var shape = elementRegistry.get('CasePlanModel');

      // when
      setText(shape, 'FOO');

      // then
      expect(LabelUtil.getLabel(shape)).to.equal('FOO');
      expect(shape.businessObject.name).to.equal('FOO');

    }));


    it('should edit Stage', inject(function(elementRegistry) {

      // given
      var shape = elementRegistry.get('PI_Stage');

      // when
      setText(shape, 'FOO');

      // then
      expect(LabelUtil.getLabel(shape)).to.equal('FOO');
      expect(shape.businessObject.definitionRef.name).to.equal('FOO');
    }));


    it('should edit Milestone', inject(function(elementRegistry) {

      // given
      var shape = elementRegistry.get('PI_Milestone');

      // when
      setText(shape, 'FOO');

      // then
      expect(LabelUtil.getLabel(shape)).to.equal('FOO');
      expect(shape.businessObject.definitionRef.name).to.equal('FOO');
    }));


    it('should edit EventListener', inject(function(elementRegistry) {

      // given
      var shape = elementRegistry.get('PI_EventListener');

      // when
      setText(shape, 'FOO');

      // then
      expect(LabelUtil.getLabel(shape)).to.equal('FOO');
      expect(shape.businessObject.definitionRef.name).to.equal('FOO');
    }));


    it('should get label text without event for OnPart', inject(function(elementRegistry, eventBus, directEditing) {

      // given
      var shape = elementRegistry.get('PlanItemOnPart_di');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      expect(directEditing._textbox.content.innerText).to.equal('PlanItemOnPart');
    }));


    it('should edit OnPart', inject(function(elementRegistry) {

      // given
      var shape = elementRegistry.get('PlanItemOnPart_di');

      // when
      setText(shape, 'FOO');

      // then
      expect(LabelUtil.getLabel(shape)).to.equal('FOO');
      expect(shape.businessObject.cmmnElementRef.name).to.equal('FOO');
    }));


    it('should edit text annotation', inject(function(elementRegistry) {

      // given
      var shape = elementRegistry.get('TextAnnotation_1');

      // when
      setText(shape, 'BAR');

      // then
      expect(LabelUtil.getLabel(shape)).to.equal('BAR');
      expect(shape.businessObject.text).to.equal('BAR');

    }));

    it('should not activate directEditing - Root', inject(function(canvas, eventBus, directEditing) {

      // given
      var shape = canvas.getRootElement();

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      expect(directEditing.isActive()).to.be.false;
    }));


    it('should not activate directEditing - EntryCriterion', inject(function(eventBus, elementRegistry, directEditing) {

      // given
      var shape = elementRegistry.get('EntryCriterion');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      expect(directEditing.isActive()).to.be.false;
    }));


    it('should not activate directEditing - ExitCriterion', inject(function(eventBus, elementRegistry, directEditing) {

      // given
      var shape = elementRegistry.get('ExitCriterion');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      expect(directEditing.isActive()).to.be.false;
    }));


    it('should not activate directEditing - Connection', inject(function(eventBus, elementRegistry, directEditing) {

      // given
      var shape = elementRegistry.get('Connection_di');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      expect(directEditing.isActive()).to.be.false;
    }));


    it('should not activate directEditing - Association', inject(function(eventBus, elementRegistry, directEditing) {

      // given
      var shape = elementRegistry.get('Association_1_di');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      expect(directEditing.isActive()).to.be.false;
    }));

    // for tasks, plan fragments and files see below...
  });


  describe('element references', function() {

    describe('task', function() {
      // The plan items PI_HumanTask_1 and PI_HumanTask_2 are referencing the same Task (HumanTask).
      // No name property is set on the plan items.

      it('should get the name from the referenced task', inject(function(modeling, elementRegistry) {

        // given
        var humanTask_1 = elementRegistry.get('PI_HumanTask_1');

        // then
        expect(humanTask_1.businessObject.name).to.be.undefined;
        expect(humanTask_1.businessObject.definitionRef.name).to.equal('HumanTask_A');
        expect(LabelUtil.getLabel(humanTask_1)).to.equal('HumanTask_A');

      }));


      it('should update the name of the plan item', inject(function(elementRegistry) {

        // given
        var humanTask_1 = elementRegistry.get('PI_HumanTask_1'),
            humanTask_2 = elementRegistry.get('PI_HumanTask_2');

        // when
        setText(humanTask_1, 'FOO');

        // then
        expect(humanTask_1.businessObject.definitionRef.name).to.equal('HumanTask_A');

        // expect the name attribute to be set on the planItem instead.
        expect(humanTask_1.businessObject.name).to.equal('FOO');
        expect(humanTask_2.businessObject.name).to.be.undefined;

      }));


      it('should update the name of the referenced task', inject(function(modeling, elementRegistry) {

        // given
        var humanTask_1 = elementRegistry.get('PI_HumanTask_1'),
            humanTask_2 = elementRegistry.get('PI_HumanTask_2');

        modeling.removeShape(humanTask_2);

        // when
        setText(humanTask_1, 'FOO');

        // then
        // expect the name of the referenced task to be changed if there is
        // exactly one plan item referencing it and no name property is set
        // on the plan item.
        expect(humanTask_1.businessObject.name).to.be.undefined;
        expect(humanTask_1.businessObject.definitionRef.name).to.equal('FOO');

      }));

    });


    describe('plan fragment', function() {
      // The discretionary items DIS_PlanFragment_1 and DIS_PlanFragment_2 are referencing the same
      // plan fragment (PlanFragment). The name property is set on the discretionary items individually.

      it('should get the name from the discretionary item', inject(function(modeling, elementRegistry) {

        // given
        var planFragment_1 = elementRegistry.get('DIS_PlanFragment_1');

        // then
        // if the name property is set on the discretionary item of the plan fragment
        expect(planFragment_1.businessObject.name).to.equal('PlanFragment 1');
        expect(planFragment_1.businessObject.definitionRef.name).to.equal('PlanFragment');
        expect(LabelUtil.getLabel(planFragment_1)).to.equal('PlanFragment 1');

      }));

      it('should update the name of the discretionary item', inject(function(modeling, elementRegistry) {

        // given
        var planFragment_1 = elementRegistry.get('DIS_PlanFragment_1'),
            planFragment_2 = elementRegistry.get('DIS_PlanFragment_2');

        // when
        setText(planFragment_1, 'FOO');

        // then
        // expect the name of the referenced plan fragment to be unchanged if the
        // name property is set on the discretionary item.
        expect(planFragment_1.businessObject.definitionRef.name).to.equal('PlanFragment');
        expect(planFragment_1.businessObject.name).to.equal('FOO');
        expect(planFragment_2.businessObject.name).to.equal('PlanFragment 2');

      }));


      it('should update the name of the discretionary item (if exclusive)', inject(function(modeling, elementRegistry) {

        // given
        var planFragment_1 = elementRegistry.get('DIS_PlanFragment_1'),
            planFragment_2 = elementRegistry.get('DIS_PlanFragment_2');

        modeling.removeShape(planFragment_2);

        // when
        setText(planFragment_1, 'FOO');

        // then
        // expect the name of the referenced plan fragment to be unchanged if there is
        // exactly one discretionary item referencing it and the name property is set
        // on this discretionary item
        expect(planFragment_1.businessObject.name).to.equal('FOO');
        expect(planFragment_1.businessObject.definitionRef.name).to.equal('PlanFragment');

      }));

    });


    describe('file', function() {
      // The case file items IT_File_1 and IT_File_2 are referencing the same File ("File").
      // No name property is set on the case file items.

      it('should get the name from the referenced file', inject(function(modeling, elementRegistry) {

        // given
        var caseFileItem_1 = elementRegistry.get('IT_File_1');

        // then
        expect(caseFileItem_1.businessObject.name).to.be.undefined;
        expect(caseFileItem_1.businessObject.definitionRef.name).to.equal('File');
        expect(LabelUtil.getLabel(caseFileItem_1)).to.equal('File');

      }));


      it('should update the name of the file', inject(function(elementRegistry) {

        // given
        var caseFileItem_1 = elementRegistry.get('IT_File_1'),
            caseFileItem_2 = elementRegistry.get('IT_File_2');


        // when
        setText(caseFileItem_1, 'FOO');

        // then
        expect(caseFileItem_1.businessObject.definitionRef.name).to.equal('File');

        // expect the name attribute to be set on the case file item.
        expect(caseFileItem_1.businessObject.name).to.equal('FOO');
        expect(caseFileItem_2.businessObject.name).to.be.undefined;

      }));


      it('should update the name of the referenced file', inject(function(modeling, elementRegistry) {

        // given
        var caseFileItem_1 = elementRegistry.get('IT_File_1'),
            caseFileItem_2 = elementRegistry.get('IT_File_2');

        modeling.removeShape(caseFileItem_2);

        // when
        setText(caseFileItem_1, 'FOO');

        // then
        // expect the name of the referenced file to be changed if there is
        // exactly one case file item referencing it and no name property is set
        // on this case file item.
        expect(caseFileItem_1.businessObject.name).to.be.undefined;
        expect(caseFileItem_1.businessObject.definitionRef.name).to.equal('FOO');

      }));

    });

  });


  describe('text box size', function() {

    it('CasePlanModel', inject(function(elementRegistry, eventBus, directEditing) {

      // given
      var shape = elementRegistry.get('CasePlanModel');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      var bbox = getBBox(directEditing);

      expect(bbox.width).to.equal(200);
      expect(bbox.height).to.equal(50);
    }));


    it('Stage', inject(function(elementRegistry, eventBus, directEditing) {

      // given
      var shape = elementRegistry.get('PI_Stage');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      var bbox = getBBox(directEditing);

      expect(bbox.width).to.equal(shape.width);
      expect(bbox.height).to.equal(16);
    }));


    it('Milestone', inject(function(elementRegistry, eventBus, directEditing) {

      // given
      var shape = elementRegistry.get('PI_Milestone');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      var bbox = getBBox(directEditing);

      expect(bbox.width).to.equal(shape.width);
      expect(bbox.height).to.equal(shape.height);
    }));


    it('EventListener', inject(function(elementRegistry, eventBus, directEditing) {

      // given
      var shape = elementRegistry.get('PI_EventListener');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      var bbox = getBBox(directEditing);

      expect(bbox.width).to.equal(150);
      expect(bbox.height).to.equal(20);
    }));


    it('OnPart', inject(function(elementRegistry, eventBus, directEditing) {

      // given
      var shape = elementRegistry.get('PlanItemOnPart_di');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      var bbox = getBBox(directEditing);

      expect(bbox.width).to.equal(150);
      expect(bbox.height).to.equal(20);
    }));


    it('Task', inject(function(elementRegistry, eventBus, directEditing) {

      // given
      var shape = elementRegistry.get('PI_HumanTask_1');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      var bbox = getBBox(directEditing);

      expect(bbox.width).to.equal(shape.width);
      expect(bbox.height).to.equal(shape.height);
    }));


    it('PlanFragment', inject(function(elementRegistry, eventBus, directEditing) {

      // given
      var shape = elementRegistry.get('DIS_PlanFragment_1');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      var bbox = getBBox(directEditing);

      expect(bbox.width).to.equal(shape.width);
      expect(bbox.height).to.equal(16);
    }));


    it('File', inject(function(elementRegistry, eventBus, directEditing) {

      // given
      var shape = elementRegistry.get('IT_File_1');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      var bbox = getBBox(directEditing);

      expect(bbox.width).to.equal(150);
      expect(bbox.height).to.equal(20);
    }));

  });


  describe('CasePlanModel label container size', function() {

    it('should expand if label text is long', inject(function(elementRegistry) {
      // given
      var shape = elementRegistry.get('CasePlanModel');

      // when
      setText(shape, 'FOO BAR FOO BAR FOO BAR FOO BAR');

      // then
      var container = domQuery('polygon', elementRegistry.getGraphics(shape));
      var containerBBox = container.getBBox();

      expect(containerBBox.width).to.be.above(240);

    }));


    it('should respect min width', inject(function(elementRegistry) {
      // given
      var shape = elementRegistry.get('CasePlanModel');

      // when
      setText(shape, '|');

      // then
      var container = domQuery('polygon', elementRegistry.getGraphics(shape));
      var containerBBox = container.getBBox();

      expect(containerBBox.width).to.equal(100);

    }));


    it('should respect max width', inject(function(elementRegistry) {
      // given
      var shape = elementRegistry.get('CasePlanModel');

      // when
      setText(shape, 'FOO ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ BAR');

      // then
      var container = domQuery('polygon', elementRegistry.getGraphics(shape));
      var containerBBox = container.getBBox();

      expect(containerBBox.width).to.be.above(370);

    }));

  });


  describe('CasePlanModel label tab', function() {

    it('should listen to pointer events', inject(function(elementRegistry) {

      var shape = elementRegistry.get('CasePlanModel');

      var gfx = elementRegistry.getGraphics(shape);

      var labelTab = gfx.querySelector('polygon');

      // expect the label tab to have the class pointerEvents set to 'all'
      // which allows click events.
      expect(labelTab.style.pointerEvents).to.equal('all');

    }));

  });

});
