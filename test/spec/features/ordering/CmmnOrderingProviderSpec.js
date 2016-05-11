'use strict';

var Helper = require('./Helper');

/* global bootstrapModeler, inject */

var move = Helper.move,
    attach = Helper.attach,
    expectZOrder = Helper.expectZOrder;

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - ordering', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('criterions', function() {

    describe('move', function() {

      var diagramXML = require('./Ordering.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should stay in front of Task', inject(function() {

        // when
        move('PI_Task_1');

        // then
        expectZOrder('PI_Task_1', 'EntryCriterion_1');
      }));


      it('should stay in front of Task, moving both', inject(function() {

        // when
        move([ 'EntryCriterion_1', 'PI_Task_1' ], 'CasePlanModel_2');

        // then
        expectZOrder('PI_Task_1', 'EntryCriterion_1');
      }));

    });


    describe('add', function() {

      var diagramXML = require('./Ordering.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should add in front of Task', inject(function() {

        // when
        var criterionShape = attach({ type: 'cmmn:ExitCriterion' }, { x: 320, y: 160 }, 'PI_Task_1');

        // then
        expectZOrder('PI_Task_1', criterionShape.id);
      }));

    });

  });

});
