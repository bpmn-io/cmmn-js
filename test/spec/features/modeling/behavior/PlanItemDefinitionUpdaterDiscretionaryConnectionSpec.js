'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #PlanItemDefinitionUpdater - discretionary connection', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('delete', function() {

    var diagramXML = require('./PlanItemDefinitionUpdater.delete-discretionary-connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var targetDefinition, stage1Definition, stage2Definition;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var connection = elementRegistry.get('DiscretionaryConnection_1');

      targetDefinition = connection.target.businessObject.definitionRef;

      var stage1 = elementRegistry.get('PI_Stage_1');
      stage1Definition = stage1.businessObject.definitionRef;

      var stage2 = elementRegistry.get('PI_Stage_2');
      stage2Definition = stage2.businessObject.definitionRef;

      // when
      modeling.removeConnection(connection);
    }));

    it('should execute', function() {
      // then
      expect(stage1Definition.get('planItemDefinitions')).not.to.include(targetDefinition);
      expect(stage2Definition.get('planItemDefinitions')).to.include(targetDefinition);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(stage1Definition.get('planItemDefinitions')).to.include(targetDefinition);
      expect(stage2Definition.get('planItemDefinitions')).not.to.include(targetDefinition);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(stage1Definition.get('planItemDefinitions')).not.to.include(targetDefinition);
      expect(stage2Definition.get('planItemDefinitions')).to.include(targetDefinition);
    }));

  });


  describe('reconnectStart', function() {

    var diagramXML = require('./PlanItemDefinitionUpdater.reconnect-start-discretionary-connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var targetDefinition, stage1Definition, casePlanModel;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var connection = elementRegistry.get('DiscretionaryConnection_1');

      targetDefinition = connection.target.businessObject.definitionRef;

      var stage1 = elementRegistry.get('PI_Stage_1');
      stage1Definition = stage1.businessObject.definitionRef;

      var stage2 = elementRegistry.get('CasePlanModel_1');
      casePlanModel = stage2.businessObject;

      var newSourceShape = elementRegistry.get('PI_HumanTask_2');
      var newWaypoints = [{
        x: newSourceShape.x + 100,
        y: newSourceShape.y + 40
      }, connection.waypoints[1]];

      // when
      modeling.reconnectStart(connection, newSourceShape, newWaypoints);
    }));

    it('should execute', function() {
      // then
      expect(stage1Definition.get('planItemDefinitions')).not.to.include(targetDefinition);
      expect(casePlanModel.get('planItemDefinitions')).to.include(targetDefinition);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(stage1Definition.get('planItemDefinitions')).to.include(targetDefinition);
      expect(casePlanModel.get('planItemDefinitions')).not.to.include(targetDefinition);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(stage1Definition.get('planItemDefinitions')).not.to.include(targetDefinition);
      expect(casePlanModel.get('planItemDefinitions')).to.include(targetDefinition);
    }));

  });


  describe('reconnectEnd', function() {

    var diagramXML = require('./PlanItemDefinitionUpdater.reconnect-end-discretionary-connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var oldTargetDefinition, newTargetDefinition, stage1Definition, stage2Definition;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var connection = elementRegistry.get('DiscretionaryConnection_1');

      oldTargetDefinition = connection.target.businessObject.definitionRef;

      var stage1 = elementRegistry.get('PI_Stage_1');
      stage1Definition = stage1.businessObject.definitionRef;

      var stage2 = elementRegistry.get('PI_Stage_2');
      stage2Definition = stage2.businessObject.definitionRef;

      var newTargetShape = elementRegistry.get('DIS_Task_2');
      newTargetDefinition = newTargetShape.businessObject.definitionRef;

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
      expect(stage1Definition.get('planItemDefinitions')).to.include(newTargetDefinition);
      expect(stage2Definition.get('planItemDefinitions')).not.to.include(newTargetDefinition);

      expect(stage1Definition.get('planItemDefinitions')).not.to.include(oldTargetDefinition);
      expect(stage2Definition.get('planItemDefinitions')).to.include(oldTargetDefinition);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(stage1Definition.get('planItemDefinitions')).not.to.include(newTargetDefinition);
      expect(stage2Definition.get('planItemDefinitions')).to.include(newTargetDefinition);

      expect(stage1Definition.get('planItemDefinitions')).to.include(oldTargetDefinition);
      expect(stage2Definition.get('planItemDefinitions')).not.to.include(oldTargetDefinition);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(stage1Definition.get('planItemDefinitions')).to.include(newTargetDefinition);
      expect(stage2Definition.get('planItemDefinitions')).not.to.include(newTargetDefinition);

      expect(stage1Definition.get('planItemDefinitions')).not.to.include(oldTargetDefinition);
      expect(stage2Definition.get('planItemDefinitions')).to.include(oldTargetDefinition);
    }));

  });


  describe('create', function() {

    var diagramXML = require('./PlanItemDefinitionUpdater.create-discretionary-connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var targetDefinition, stage1Definition, stage2Definition;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var sourceShape = elementRegistry.get('PI_HumanTask_1');

      var targetShape = elementRegistry.get('DIS_Task_1');
      targetDefinition = targetShape.businessObject.definitionRef;

      var stage1 = elementRegistry.get('PI_Stage_1');
      stage1Definition = stage1.businessObject.definitionRef;

      var stage2 = elementRegistry.get('PI_Stage_2');
      stage2Definition = stage2.businessObject.definitionRef;

      // when
      modeling.connect(sourceShape, targetShape, { type: 'cmmndi:CMMNEdge' });
    }));

    it('should execute', function() {
      // then
      expect(stage1Definition.get('planItemDefinitions')).to.include(targetDefinition);
      expect(stage2Definition.get('planItemDefinitions')).not.to.include(targetDefinition);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(stage1Definition.get('planItemDefinitions')).not.to.include(targetDefinition);
      expect(stage2Definition.get('planItemDefinitions')).to.include(targetDefinition);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(stage1Definition.get('planItemDefinitions')).to.include(targetDefinition);
      expect(stage2Definition.get('planItemDefinitions')).not.to.include(targetDefinition);
    }));

  });


  describe('chain', function() {

    var diagramXML = require('./PlanItemDefinitionUpdater.chain-discretionary-connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var target1Definition, target2Definition, stage1Definition, stage2Definition;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      var connection = elementRegistry.get('DiscretionaryConnection_1');

      target1Definition = connection.target.businessObject.definitionRef;
      target2Definition = elementRegistry.get('DIS_Task_1').businessObject.definitionRef;

      var stage1 = elementRegistry.get('PI_Stage_1');
      stage1Definition = stage1.businessObject.definitionRef;

      var stage2 = elementRegistry.get('PI_Stage_2');
      stage2Definition = stage2.businessObject.definitionRef;

      var newSourceShape = elementRegistry.get('PI_HumanTask_3');
      var newWaypoints = [{
        x: newSourceShape.x + 100,
        y: newSourceShape.y + 40
      }, connection.waypoints[1]];

      // when
      modeling.reconnectStart(connection, newSourceShape, newWaypoints);
    }));

    it('should execute', function() {
      // then
      expect(stage1Definition.get('planItemDefinitions')).to.include(target1Definition);
      expect(stage2Definition.get('planItemDefinitions')).not.to.include(target1Definition);

      expect(stage1Definition.get('planItemDefinitions')).to.include(target2Definition);
      expect(stage2Definition.get('planItemDefinitions')).not.to.include(target2Definition);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(stage1Definition.get('planItemDefinitions')).not.to.include(target1Definition);
      expect(stage2Definition.get('planItemDefinitions')).to.include(target1Definition);

      expect(stage1Definition.get('planItemDefinitions')).not.to.include(target2Definition);
      expect(stage2Definition.get('planItemDefinitions')).to.include(target2Definition);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(stage1Definition.get('planItemDefinitions')).to.include(target1Definition);
      expect(stage2Definition.get('planItemDefinitions')).not.to.include(target1Definition);

      expect(stage1Definition.get('planItemDefinitions')).to.include(target2Definition);
      expect(stage2Definition.get('planItemDefinitions')).not.to.include(target2Definition);
    }));

  });

});
