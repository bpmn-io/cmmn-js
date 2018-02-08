'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #PlanningTableUpdater - discretionary connection', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('delete', function() {

    var diagramXML = require('./PlanningTableUpdater.discretionary-connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var source, target, oldPlanningTable;

    describe('should add discretionary item to case plan model', function() {

      var casePlanModel;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var connection = elementRegistry.get('DiscretionaryConnection_2');

        source = connection.source.businessObject;
        target = connection.target.businessObject;

        oldPlanningTable = target.$parent;

        casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

        // when
        modeling.removeConnection(connection);
      }));


      it('should execute', function() {
        expect(casePlanModel.planningTable.get('tableItems')).to.include(target);
        expect(source.definitionRef.planningTable).not.to.exist;
        expect(oldPlanningTable.get('tableItems')).not.to.include(target);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(casePlanModel.planningTable.get('tableItems')).not.to.include(target);
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.include(target);
        expect(oldPlanningTable.get('tableItems')).to.include(target);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(casePlanModel.planningTable.get('tableItems')).to.include(target);
        expect(source.definitionRef.planningTable).not.to.exist;
        expect(oldPlanningTable.get('tableItems')).not.to.include(target);
      }));

    });


    describe('should keep human tasks planning table', function() {

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var connection = elementRegistry.get('DiscretionaryConnection_3');

        source = connection.source.businessObject;
        target = connection.target.businessObject;

        // when
        modeling.removeConnection(connection);
      }));


      it('should execute', function() {
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.have.length(1);
        expect(source.definitionRef.planningTable.get('tableItems')).not.to.include(target);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.have.length(2);
        expect(source.definitionRef.planningTable.get('tableItems')).to.include(target);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.have.length(1);
        expect(source.definitionRef.planningTable.get('tableItems')).not.to.include(target);
      }));

    });


    describe('should add discretionary item to stage', function() {

      var stage;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var connection = elementRegistry.get('DiscretionaryConnection_1');

        source = connection.source.businessObject;
        target = connection.target.businessObject;

        oldPlanningTable = target.$parent;

        stage = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

        // when
        modeling.removeConnection(connection);
      }));


      it('should execute', function() {
        expect(stage.planningTable.get('tableItems')).to.include(target);
        expect(source.definitionRef.planningTable).not.to.exist;
        expect(oldPlanningTable.get('tableItems')).not.to.include(target);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(stage.planningTable.get('tableItems')).not.to.include(target);
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.include(target);
        expect(oldPlanningTable.get('tableItems')).to.include(target);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(stage.planningTable.get('tableItems')).to.include(target);
        expect(source.definitionRef.planningTable).not.to.exist;
        expect(oldPlanningTable.get('tableItems')).not.to.include(target);
      }));

    });


    describe('should keep human tasks planning table inside stage', function() {

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var connection = elementRegistry.get('DiscretionaryConnection_5');

        source = connection.source.businessObject;
        target = connection.target.businessObject;

        // when
        modeling.removeConnection(connection);
      }));


      it('should execute', function() {
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.have.length(1);
        expect(source.definitionRef.planningTable.get('tableItems')).not.to.include(target);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.have.length(2);
        expect(source.definitionRef.planningTable.get('tableItems')).to.include(target);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.have.length(1);
        expect(source.definitionRef.planningTable.get('tableItems')).not.to.include(target);
      }));

    });

  });


  describe('create', function() {

    var diagramXML = require('./PlanningTableUpdater.discretionary-connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var sourceShape, targetShape, source, target, oldPlanningTable;

    describe('should remove discretionary item from case plan model', function() {

      var casePlanModel;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        sourceShape = elementRegistry.get('PI_HumanTask_2');
        source = sourceShape.businessObject;

        targetShape = elementRegistry.get('DIS_Task_1');
        target = targetShape.businessObject;

        oldPlanningTable = target.$parent;

        casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

        // when
        modeling.connect(sourceShape, targetShape, { type: 'cmmndi:CMMNEdge' });
      }));


      it('should execute', function() {
        // then
        expect(casePlanModel.planningTable).not.to.exist;
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.include(target);
        expect(oldPlanningTable.get('tableItems')).not.to.include(target);
      });


      it('should undo', inject(function(commandStack) {
        // when
        var planningTable = target.$parent;
        commandStack.undo();

        // then
        expect(casePlanModel.planningTable).to.exist;
        expect(source.definitionRef.planningTable).not.to.exist;
        expect(planningTable.get('tableItems')).not.to.include(target);
        expect(oldPlanningTable.get('tableItems')).to.include(target);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(casePlanModel.planningTable).not.to.exist;
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.include(target);
        expect(oldPlanningTable.get('tableItems')).not.to.include(target);
      }));

    });


    describe('should add discretionary item to existing human tasks planning table', function() {

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        sourceShape = elementRegistry.get('PI_HumanTask_1');
        source = sourceShape.businessObject;

        targetShape = elementRegistry.get('DIS_Task_1');
        target = targetShape.businessObject;

        // when
        modeling.connect(sourceShape, targetShape, { type: 'cmmndi:CMMNEdge' });
      }));


      it('should execute', function() {
        // then
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.have.length(2);
        expect(source.definitionRef.planningTable.get('tableItems')).to.include(target);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.have.length(1);
        expect(source.definitionRef.planningTable.get('tableItems')).not.to.include(target);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.have.length(2);
        expect(source.definitionRef.planningTable.get('tableItems')).to.include(target);
      }));

    });


    describe('should remove discretionary item from stage', function() {

      var stage;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        sourceShape = elementRegistry.get('PI_HumanTask_4');
        source = sourceShape.businessObject;

        targetShape = elementRegistry.get('DIS_Task_4');
        target = targetShape.businessObject;

        oldPlanningTable = target.$parent;

        stage = elementRegistry.get('PI_Stage_1').businessObject.definitionRef;

        // when
        modeling.connect(sourceShape, targetShape, { type: 'cmmndi:CMMNEdge' });
      }));


      it('should execute', function() {
        // then
        expect(stage.planningTable).not.to.exist;
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.include(target);
        expect(oldPlanningTable.get('tableItems')).not.to.include(target);
      });


      it('should undo', inject(function(commandStack) {
        // when
        var planningTable = target.$parent;
        commandStack.undo();

        // then
        expect(stage.planningTable).to.exist;
        expect(source.definitionRef.planningTable).not.to.exist;
        expect(planningTable.get('tableItems')).not.to.include(target);
        expect(oldPlanningTable.get('tableItems')).to.include(target);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(stage.planningTable).not.to.exist;
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.include(target);
        expect(oldPlanningTable.get('tableItems')).not.to.include(target);
      }));

    });


    describe('should add discretionary item to existing human tasks planning table (inside stage)', function() {

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        sourceShape = elementRegistry.get('PI_HumanTask_3');
        source = sourceShape.businessObject;

        targetShape = elementRegistry.get('DIS_Task_4');
        target = targetShape.businessObject;

        // when
        modeling.connect(sourceShape, targetShape, { type: 'cmmndi:CMMNEdge' });
      }));


      it('should execute', function() {
        // then
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.have.length(2);
        expect(source.definitionRef.planningTable.get('tableItems')).to.include(target);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.have.length(1);
        expect(source.definitionRef.planningTable.get('tableItems')).not.to.include(target);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(source.definitionRef.planningTable).to.exist;
        expect(source.definitionRef.planningTable.get('tableItems')).to.have.length(2);
        expect(source.definitionRef.planningTable.get('tableItems')).to.include(target);
      }));

    });

  });


  describe('reconnectStart', function() {

    var diagramXML = require('./PlanningTableUpdater.discretionary-connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var oldSource, newSource, target, oldSourceDefinition, newSourceDefinition;

    describe('should create planning table', function() {

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var connection = elementRegistry.get('DiscretionaryConnection_2');
        oldSource = connection.source.businessObject;
        oldSourceDefinition = oldSource.definitionRef;

        var newSourceShape = elementRegistry.get('PI_HumanTask_2');
        newSource = newSourceShape.businessObject;
        newSourceDefinition = newSource.definitionRef;

        target = connection.target.businessObject;

        var newWaypoints = [{
          x: newSourceShape.x + 100,
          y: newSourceShape.y + 40
        }, connection.waypoints[1]];

        // when
        modeling.reconnectStart(connection, newSourceShape, newWaypoints);
      }));


      it('should execute', function() {
        // then
        expect(newSourceDefinition.planningTable).to.exist;
        expect(newSourceDefinition.planningTable.get('tableItems')).to.include(target);

        expect(target.$parent).to.equal(newSourceDefinition.planningTable);

        expect(oldSourceDefinition.planningTable).not.to.exist;
      });


      it('should undo', inject(function(commandStack) {
        // when
        var planningTable = newSourceDefinition.planningTable;
        commandStack.undo();

        // then
        expect(newSourceDefinition.planningTable).not.to.exist;
        expect(planningTable.get('tableItems')).not.to.include(target);

        expect(oldSourceDefinition.planningTable).to.exist;
        expect(oldSourceDefinition.planningTable.get('tableItems')).to.include(target);

        expect(target.$parent).to.equal(oldSourceDefinition.planningTable);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newSourceDefinition.planningTable).to.exist;
        expect(newSourceDefinition.planningTable.get('tableItems')).to.include(target);

        expect(target.$parent).to.equal(newSourceDefinition.planningTable);

        expect(oldSourceDefinition.planningTable).not.to.exist;
      }));

    });


    describe('should add to existing planning table', function() {

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var connection = elementRegistry.get('DiscretionaryConnection_2');
        oldSource = connection.source.businessObject;
        oldSourceDefinition = oldSource.definitionRef;

        var newSourceShape = elementRegistry.get('PI_HumanTask_5');
        newSource = newSourceShape.businessObject;
        newSourceDefinition = newSource.definitionRef;

        target = connection.target.businessObject;

        var newWaypoints = [{
          x: newSourceShape.x + 100,
          y: newSourceShape.y + 40
        }, connection.waypoints[1]];

        // when
        modeling.reconnectStart(connection, newSourceShape, newWaypoints);
      }));


      it('should execute', function() {
        // then
        expect(newSourceDefinition.planningTable).to.exist;
        expect(newSourceDefinition.planningTable.get('tableItems')).to.include(target);
        expect(newSourceDefinition.planningTable.get('tableItems')).to.have.length(3);

        expect(target.$parent).to.equal(newSourceDefinition.planningTable);

        expect(oldSourceDefinition.planningTable).not.to.exist;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(newSourceDefinition.planningTable).to.exist;
        expect(newSourceDefinition.planningTable.get('tableItems')).not.to.include(target);
        expect(newSourceDefinition.planningTable.get('tableItems')).to.have.length(2);

        expect(oldSourceDefinition.planningTable).to.exist;
        expect(oldSourceDefinition.planningTable.get('tableItems')).to.include(target);

        expect(target.$parent).to.equal(oldSourceDefinition.planningTable);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newSourceDefinition.planningTable).to.exist;
        expect(newSourceDefinition.planningTable.get('tableItems')).to.include(target);
        expect(newSourceDefinition.planningTable.get('tableItems')).to.have.length(3);

        expect(target.$parent).to.equal(newSourceDefinition.planningTable);

        expect(oldSourceDefinition.planningTable).not.to.exist;
      }));

    });

  });


  describe('reconnectEnd', function() {

    var diagramXML = require('./PlanningTableUpdater.discretionary-connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var oldTarget, newTarget, source, casePlanModel;

    describe('should remove/add to planning table', function() {

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var connection = elementRegistry.get('DiscretionaryConnection_2');
        oldTarget = connection.target.businessObject;

        var newTargetShape = elementRegistry.get('DIS_Task_1');
        newTarget = newTargetShape.businessObject;

        source = connection.source.businessObject.definitionRef;

        casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

        var newWaypoints = [
          connection.waypoints[0],
          {
            x: newTargetShape.x,
            y: newTargetShape.y + 40
          }
        ];

        // when
        modeling.reconnectEnd(connection, newTargetShape, newWaypoints);
      }));


      it('should execute', function() {
        // then
        expect(source.planningTable.get('tableItems')).not.to.include(oldTarget);
        expect(source.planningTable.get('tableItems')).to.include(newTarget);

        expect(casePlanModel.planningTable.get('tableItems')).to.include(oldTarget);
        expect(casePlanModel.planningTable.get('tableItems')).not.to.include(newTarget);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(source.planningTable.get('tableItems')).to.include(oldTarget);
        expect(source.planningTable.get('tableItems')).not.to.include(newTarget);

        expect(casePlanModel.planningTable.get('tableItems')).not.to.include(oldTarget);
        expect(casePlanModel.planningTable.get('tableItems')).to.include(newTarget);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(source.planningTable.get('tableItems')).not.to.include(oldTarget);
        expect(source.planningTable.get('tableItems')).to.include(newTarget);

        expect(casePlanModel.planningTable.get('tableItems')).to.include(oldTarget);
        expect(casePlanModel.planningTable.get('tableItems')).not.to.include(newTarget);
      }));

    });

  });

  describe('delete human task plan item with discretionary items', function() {

    var diagramXML = require('./PlanningTableUpdater.without-discretionary-connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var casePlanModel, discretionaryItem;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given

      var discretionaryItemShape = elementRegistry.get('DIS_Task_2');
      discretionaryItem = discretionaryItemShape.businessObject;

      var casePlanModelShape = elementRegistry.get('CasePlanModel_1');
      casePlanModel = casePlanModelShape.businessObject;

      var shape = elementRegistry.get('PI_Task_1');

      // when
      modeling.removeShape(shape);
    }));

    it('should execute', function() {
      // when
      expect(casePlanModel.planningTable.get('tableItems')).to.include(discretionaryItem);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(casePlanModel.planningTable).not.to.exist;
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(casePlanModel.planningTable.get('tableItems')).to.include(discretionaryItem);
    }));

  });


  describe('switch source/target', function() {

    var diagramXML = require('./PlanningTableUpdater.switch-source-target.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var oldSource, oldTarget, newTarget, casePlanModel;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      var connection = elementRegistry.get('DiscretionaryConnection_1');

      oldSource = connection.source;
      oldTarget = connection.target;
      casePlanModel = elementRegistry.get('CasePlanModel_1').businessObject;

      newTarget = elementRegistry.get('DIS_Task_3');

      var newWaypoints = [{
        x: newTarget.x + 50,
        y: newTarget.y + 40
      }, connection.waypoints[1]];

      // when
      modeling.reconnectStart(connection, newTarget, newWaypoints);

      newTarget = connection.target;

    }));

    it('should execute', function() {
      var tableItems = oldTarget.businessObject.definitionRef.planningTable.get('tableItems');

      // then
      expect(tableItems).to.include(newTarget.businessObject);
      expect(casePlanModel.planningTable.get('tableItems')).to.include(oldTarget.businessObject);
      expect(oldSource.planningTable).not.to.exist;
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      var tableItems = oldSource.businessObject.definitionRef.planningTable.get('tableItems');

      // then
      expect(tableItems).to.include(oldTarget.businessObject);
      expect(casePlanModel.planningTable.get('tableItems')).to.include(newTarget.businessObject);
      expect(oldTarget.planningTable).not.to.exist;
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      var tableItems = oldTarget.businessObject.definitionRef.planningTable.get('tableItems');

      // then
      expect(tableItems).to.include(newTarget.businessObject);
      expect(casePlanModel.planningTable.get('tableItems')).to.include(oldTarget.businessObject);
      expect(oldSource.planningTable).not.to.exist;
    }));

  });

});
