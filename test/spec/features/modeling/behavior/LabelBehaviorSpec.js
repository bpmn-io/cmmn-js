'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('behavior - LabelBehavior', function() {

  var diagramXML = require('./LabelBehavior.cmmn');

  var testModules = [ modelingModule, coreModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('add label', function() {

    it('should add to case plan item on part connection', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('CaseFileItem_1'),
          target = elementRegistry.get('ExitCriterion_2');

      // when
      var connection = modeling.connect(source, target);

      // then
      expect(connection.label).to.exist;
    }));


    it('should add to plan item on part connection', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('PI_HumanTask_2'),
          target = elementRegistry.get('ExitCriterion_1');

      // when
      var connection = modeling.connect(source, target);

      // then
      expect(connection.label).to.exist;
    }));


    it('should add to event listener', inject(function(elementFactory, elementRegistry, modeling) {

      // given
      var casePlanModel = elementRegistry.get('CasePlanModel_1'),
          newShapeAttrs = elementFactory.createPlanItemShape('cmmn:EventListener');

      // when
      var newShape = modeling.createShape(newShapeAttrs, { x: 300, y: 300 }, casePlanModel);

      // then
      expect(newShape.label).to.exist;
    }));


    it('should not add to task', inject(function(elementFactory, elementRegistry, modeling) {

      // given
      var casePlanModel = elementRegistry.get('CasePlanModel_1'),
          newShapeAttrs = elementFactory.createPlanItemShape('cmmn:Task');

      // when
      var newShape = modeling.createShape(newShapeAttrs, { x: 300, y: 300 }, casePlanModel);

      // then
      expect(newShape.label).not.to.exist;
    }));

  });


});
