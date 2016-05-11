'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');

var is = require('../../../../../lib/util/ModelUtil').is,
    find = require('lodash/collection/find');

function getConnection(source, target, connectionOrType) {
  return find(source.outgoing, function(c) {
    var cmmnElement = c.businessObject.cmmnElementRef || c.businessObject;
    return c.target === target &&
      (typeof connectionOrType === 'string' ? is(cmmnElement, connectionOrType) : c === connectionOrType);
  });
}

function expectConnected(source, target, connectionOrType) {
  expect(getConnection(source, target, connectionOrType)).to.exist;
}

function expectNotConnected(source, target, connectionOrType) {
  expect(getConnection(source, target, connectionOrType)).not.to.exist;
}

describe('features/modeling - #ReplaceConnectionBehavior - connection', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('should remove discretionary item from human task', function() {

    var source, target, discretionaryItem, planningTable;

    var diagramXML = require('./ReplaceConnectionBehavior.move.cmmn');

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

  describe('plan item on part <> case file item on part', function() {

    var diagramXML = require('./ReplaceConnectionBehavior.connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var newSource, source, target, connection;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      connection = elementRegistry.get('PlanItemOnPart_1_di');
      var newSourceShape = elementRegistry.get('CaseFileItem_1');

      newSource = newSourceShape;
      source = connection.source;
      target = connection.target;

      var newWaypoints = [{
        x: newSourceShape.x + 50,
        y: newSourceShape.y + 40
      }, connection.waypoints[1]];

      // when
      modeling.reconnectStart(connection, newSourceShape, newWaypoints);

    }));

    it('should execute', function() {
      // then
      expectConnected(newSource, target, 'cmmn:CaseFileItemOnPart');
      expectNotConnected(source, target, 'cmmn:PlanItemOnPart');

      var con = getConnection(newSource, target, 'cmmn:CaseFileItemOnPart');
      expect(con.isStandardEventVisible).to.be.true;
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expectNotConnected(newSource, target, 'cmmn:CaseFileItemOnPart');
      expectConnected(source, target, connection);

    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expectConnected(newSource, target, 'cmmn:CaseFileItemOnPart');
      expectNotConnected(source, target, 'cmmn:PlanItemOnPart');

      var con = getConnection(newSource, target, 'cmmn:CaseFileItemOnPart');
      expect(con.isStandardEventVisible).to.be.true;

    }));

  });


  describe('plan item on part <> discretionary connection', function() {

    var diagramXML = require('./ReplaceConnectionBehavior.connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var newTarget, source, target, connection;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      connection = elementRegistry.get('PlanItemOnPart_1_di');
      var newTargetShape = elementRegistry.get('DIS_Task_5');

      newTarget = newTargetShape;
      source = connection.source;
      target = connection.target;

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
      expectConnected(source, newTarget, 'cmmndi:CMMNEdge');
      expectNotConnected(source, target, 'cmmn:PlanItemOnPart');
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expectNotConnected(source, newTarget, 'cmmndi:CMMNEdge');
      expectConnected(source, target, connection);

    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expectConnected(source, newTarget, 'cmmndi:CMMNEdge');
      expectNotConnected(source, target, 'cmmn:PlanItemOnPart');

    }));

  });


  describe('case file item on part <> plan item on part', function() {

    var diagramXML = require('./ReplaceConnectionBehavior.connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var newSource, source, target, connection;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      connection = elementRegistry.get('CaseFileItemOnPart_1_di');
      var newSourceShape = elementRegistry.get('PI_HumanTask_1');

      newSource = newSourceShape;
      source = connection.source;
      target = connection.target;

      var newWaypoints = [{
        x: newSourceShape.x + 100,
        y: newSourceShape.y + 40
      }, connection.waypoints[1]];

      // when
      modeling.reconnectStart(connection, newSourceShape, newWaypoints);

    }));

    it('should execute', function() {
      // then
      expectConnected(newSource, target, 'cmmn:PlanItemOnPart');
      expectNotConnected(source, target, 'cmmn:CaseFileItemOnPart');
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expectNotConnected(newSource, target, 'cmmn:PlanItemOnPart');
      expectConnected(source, target, connection);

    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expectConnected(newSource, target, 'cmmn:PlanItemOnPart');
      expectNotConnected(source, target, 'cmmn:CaseFileItemOnPart');

    }));

  });


  describe('discretionary connection <> plan item on part', function() {

    var diagramXML = require('./ReplaceConnectionBehavior.connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var newTarget, source, target, connection;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      connection = elementRegistry.get('DiscretionaryConnection_1');
      var newTargetShape = elementRegistry.get('EntryCriterion_1');

      newTarget = newTargetShape;
      source = connection.source;
      target = connection.target;

      var newWaypoints = [
        connection.waypoints[0],
        {
          x: newTargetShape.x,
          y: newTargetShape.y + 14
        }
      ];

      // when
      modeling.reconnectEnd(connection, newTargetShape, newWaypoints);

    }));

    it('should execute', function() {
      // then
      expectConnected(source, newTarget, 'cmmn:PlanItemOnPart');
      expectNotConnected(source, target, 'cmmndi:CMMNEdge');
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expectNotConnected(source, newTarget, 'cmmn:PlanItemOnPart');
      expectConnected(source, target, connection);

    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expectConnected(source, newTarget, 'cmmn:PlanItemOnPart');
      expectNotConnected(source, target, 'cmmndi:CMMNEdge');

    }));

  });


  describe('replace', function() {

    describe('should update sourceRef of planItemOnpart', function() {

      var diagramXML = require('./ReplaceConnectionBehavior.replace.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      var oldElement, newElement, onPart;

      beforeEach(inject(function(elementRegistry, modeling, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_Task_1');
        onPart = elementRegistry.get('PlanItemOnPart_1_di').businessObject.cmmnElementRef;

        var newElementData = {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:HumanTask'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));

      it('should execute', function() {
        // then
        expect(onPart.sourceRef).to.equal(newElement.businessObject);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(onPart.sourceRef).to.equal(oldElement.businessObject);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(onPart.sourceRef).to.equal(newElement.businessObject);
      }));

    });


    describe('should remove planItemOnPart', function() {

      var diagramXML = require('./ReplaceConnectionBehavior.replace.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      var oldElement, newElement, exitCriterion;

      beforeEach(inject(function(elementRegistry, modeling, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_Task_1');
        exitCriterion = elementRegistry.get('ExitCriterion_1');

        var newElementData = {
          type: 'cmmn:DiscretionaryItem',
          definitionType: 'cmmn:HumanTask'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(elementRegistry.get('PlanItemOnPart_1_di')).not.to.exist;
        expect(exitCriterion.outgoing).to.be.empty;
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get('PlanItemOnPart_1_di')).to.exist;
        expect(exitCriterion.outgoing).to.have.length(1);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(elementRegistry.get('PlanItemOnPart_1_di')).not.to.exist;
        expect(exitCriterion.outgoing).to.be.empty;
      }));

    });

  });

});
