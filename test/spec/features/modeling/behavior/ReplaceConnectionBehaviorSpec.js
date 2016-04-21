'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #ReplaceConnectionBehavior - discretionary connection', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('should remove discretionary item from human task', function() {

    var source, target, shape, oldPlanningTable, discretionaryItem;

    var diagramXML = require('./ReplaceConnectionBehavior.move.cmmn');

    var source, target, planningTable, discretionaryItem;

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var shape = elementRegistry.get('PI_HumanTask_1');
      source = shape.businessObject.definitionRef;
      planningTable = source.planningTable;

      var discretionaryItemShape = elementRegistry.get('DIS_Task_1');
      discretionaryItem = discretionaryItemShape.businessObject;

      var targetShape = elementRegistry.get('CasePlanModel_1');
      target = targetShape.businessObject;

      // when
      modeling.moveElements( [ shape ], { x: 0, y: 150 }, targetShape, false, { primaryShape: shape });

    }));

    it('should execute', function() {
      // when
      expect(source.planningTable).not.to.exist;
      expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(source.planningTable).to.equal(planningTable);
      expect(planningTable.get('tableItems')).to.include(discretionaryItem);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(source.planningTable).not.to.exist;
      expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
    }));

  });

});
