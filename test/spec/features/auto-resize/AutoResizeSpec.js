'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */

var pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign');

var autoResizeModule = require('../../../../lib/features/auto-resize'),
    modelingModule = require('../../../../lib/features/modeling'),
    createModule = require('diagram-js/lib/features/create'),
    coreModule = require('../../../../lib/core');

function getBounds(shape) {
  return pick(shape, [ 'x', 'y', 'width', 'height' ]);
}


describe('features/auto-resize', function() {

  var testModules = [ coreModule, modelingModule, autoResizeModule, createModule ];

  var diagramXML = require('./auto-resize.cmmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  it('should expand stage',
    inject(function(elementRegistry, modeling) {

      // given
      var stagePI = elementRegistry.get('PI_Stage_1'),
          taskPI = elementRegistry.get('PI_Task_2');

      var originalBounds = getBounds(stagePI);

      // when
      modeling.moveElements([ taskPI ], { x: -150, y: 0 }, stagePI);

      // then
      var expectedBounds = assign(originalBounds, { x: 148, width: 482 });

      expect(stagePI).to.have.bounds(expectedBounds);
    })
  );


  it('should expand case plan model',
    inject(function(elementRegistry, modeling, elementFactory) {

      // given
      var casePlanModelPI = elementRegistry.get('CasePlanModel_1'),
          taskPI = elementRegistry.get('PI_Task_1');

      var originalBounds = getBounds(casePlanModelPI);

      modeling.moveElements([ taskPI ], { x: -50, y: 0 }, casePlanModelPI);

      // then
      var expectedBounds = assign(originalBounds, { x: 0, width: 1052 });

      expect(casePlanModelPI).to.have.bounds(expectedBounds);
    })
  );


  it('should expand plan fragment',
    inject(function(elementRegistry, modeling, elementFactory) {

      // given
      var PlanFragmentDI = elementRegistry.get('DI_PlanFragment_1'),
          taskPI = elementRegistry.get('PI_Task_1');

      var originalBounds = getBounds(PlanFragmentDI);

      modeling.moveElements([ taskPI ], { x: 600, y: 120 }, PlanFragmentDI);

      // then
      var expectedBounds = assign(originalBounds, { y: 153, height: 263 });

      expect(PlanFragmentDI).to.have.bounds(expectedBounds);
    })
  );

});
