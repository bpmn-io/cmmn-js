'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');

var is = require('../../../../../lib/util/ModelUtil').is,
    find = require('min-dash').find;

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

    var source, discretionaryItem, planningTable;

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

      // when
      modeling.moveElements([ shape ], { x: 0, y: 150 }, targetShape, { primaryShape: shape });

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


  describe('plan item on part <> association', function() {

    var diagramXML = require('./ReplaceConnectionBehavior.connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var newTarget, source, target, connection;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      connection = elementRegistry.get('PlanItemOnPart_1_di');
      var newTargetShape = elementRegistry.get('TextAnnotation_1');

      newTarget = newTargetShape;
      source = connection.source;
      target = connection.target;

      var newWaypoints = [
        connection.waypoints[0],
        {
          x: newTargetShape.x,
          y: newTargetShape.y + 15
        }
      ];

      // when
      modeling.reconnectEnd(connection, newTargetShape, newWaypoints);

    }));

    it('should execute', function() {
      // then
      expectConnected(source, newTarget, 'cmmn:Association');
      expectNotConnected(source, target, 'cmmn:PlanItemOnPart');
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expectNotConnected(source, newTarget, 'cmmn:Association');
      expectConnected(source, target, connection);

    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expectConnected(source, newTarget, 'cmmn:Association');
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


  describe('case file item on part <> association', function() {

    var diagramXML = require('./ReplaceConnectionBehavior.connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var newSource, source, target, connection;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      connection = elementRegistry.get('CaseFileItemOnPart_1_di');
      var newSourceShape = elementRegistry.get('TextAnnotation_1');

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
      expectConnected(newSource, target, 'cmmn:Association');
      expectNotConnected(source, target, 'cmmn:CaseFileItemOnPart');
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expectNotConnected(newSource, target, 'cmmn:Association');
      expectConnected(source, target, connection);

    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expectConnected(newSource, target, 'cmmn:Association');
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


  describe('discretionary connection <> association', function() {

    var diagramXML = require('./ReplaceConnectionBehavior.connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var newTarget, source, target, connection;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      connection = elementRegistry.get('DiscretionaryConnection_1');
      var newTargetShape = elementRegistry.get('TextAnnotation_1');

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
      expectConnected(source, newTarget, 'cmmn:Association');
      expectNotConnected(source, target, 'cmmndi:CMMNEdge');
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expectNotConnected(source, newTarget, 'cmmn:Association');
      expectConnected(source, target, connection);

    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expectConnected(source, newTarget, 'cmmn:Association');
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

      var oldElement, exitCriterion;

      beforeEach(inject(function(elementRegistry, modeling, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_Task_1');
        exitCriterion = elementRegistry.get('ExitCriterion_1');

        var newElementData = {
          type: 'cmmn:DiscretionaryItem',
          definitionType: 'cmmn:HumanTask'
        };

        // when
        cmmnReplace.replaceElement(oldElement, newElementData);

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


  describe('update properties', function() {

    describe('should remove discretionary connection when setting human task to non-blocking', function() {

      var diagramXML = require('./ReplaceConnectionBehavior.connection.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var task = elementRegistry.get('PI_HumanTask_1');

        // when
        modeling.updateControls(task, {
          isBlocking: false
        });

      }));

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(elementRegistry.get('DiscretionaryConnection_1')).not.to.exist;
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get('DiscretionaryConnection_1')).to.exist;
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(elementRegistry.get('DiscretionaryConnection_1')).not.to.exist;
      }));

    });

  });

  describe('selection', function() {

    describe('should select replaced connection on reconnect', function() {

      var source;

      var diagramXML = require('./ReplaceConnectionBehavior.connection.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var connection = elementRegistry.get('PlanItemOnPart_1_di');
        var targetShape = elementRegistry.get('DIS_Task_5');

        source = connection.source;

        var newWaypoints = [
          connection.waypoints[0],
          {
            x: targetShape.x,
            y: targetShape.y + 40
          }
        ];

        // when
        modeling.reconnectEnd(connection, targetShape, newWaypoints);

      }));

      it('should execute', inject(function(selection) {
        // then
        expect(selection.get()).to.include(source.outgoing[0]);
      }));


      it('should undo', inject(function(selection, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(selection.get()).to.be.empty;
      }));


      it('should redo', inject(function(selection, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(selection.get()).to.be.empty;
      }));

    });

  });


  describe('switch source/target', function() {

    var diagramXML = require('./ReplaceConnectionBehavior.connection.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('reconnectEnd', function() {

      var connection, oldSource, newSource, oldTarget;

      describe('plan item on part connection', function() {

        beforeEach(inject(function(elementRegistry, modeling) {

          // given
          connection = elementRegistry.get('PlanItemOnPart_2_di');

          oldSource = connection.source;
          oldTarget = connection.target;

          newSource = elementRegistry.get('PI_Task_7');

          var newWaypoints = [
            connection.waypoints[0],
            {
              x: newSource.x,
              y: newSource.y + 20
            }
          ];

          // when
          modeling.reconnectEnd(connection, newSource, newWaypoints);

        }));


        it('should execute', function() {
          // then
          expect(connection.source).to.equal(newSource);
          expect(connection.target).to.equal(oldSource);

          expect(connection.businessObject.cmmnElementRef.sourceRef).to.equal(newSource.businessObject);
          expect(connection.businessObject.targetCMMNElementRef).to.equal(oldSource.businessObject);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(connection.source).to.equal(oldSource);
          expect(connection.target).to.equal(oldTarget);

          expect(connection.businessObject.cmmnElementRef.sourceRef).to.equal(oldSource.host.businessObject);
          expect(connection.businessObject.cmmnElementRef.exitCriterionRef).to.equal(oldSource.businessObject);
          expect(connection.businessObject.targetCMMNElementRef).to.equal(oldTarget.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(connection.source).to.equal(newSource);
          expect(connection.target).to.equal(oldSource);

          expect(connection.businessObject.cmmnElementRef.sourceRef).to.equal(newSource.businessObject);
          expect(connection.businessObject.targetCMMNElementRef).to.equal(oldSource.businessObject);

        }));

      });

    });


    describe('reconnectStart', function() {

      var connection, oldSource, oldTarget, newTarget;

      describe('discretionary connection', function() {

        beforeEach(inject(function(elementRegistry, modeling) {

          // given
          connection = elementRegistry.get('DiscretionaryConnection_1');

          oldSource = connection.source;
          oldTarget = connection.target;

          newTarget = elementRegistry.get('DIS_Task_8');

          var newWaypoints = [{
            x: newTarget.x + 50,
            y: newTarget.y + 40
          }, connection.waypoints[1]];

          // when
          modeling.reconnectStart(connection, newTarget, newWaypoints);

        }));

        it('should execute', function() {
          // then
          expect(connection.source).to.equal(oldTarget);
          expect(connection.target).to.equal(newTarget);

          expect(connection.businessObject.sourceCMMNElementRef).to.equal(oldTarget.businessObject);
          expect(connection.businessObject.targetCMMNElementRef).to.equal(newTarget.businessObject);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(connection.source).to.equal(oldSource);
          expect(connection.target).to.equal(oldTarget);

          expect(connection.businessObject.sourceCMMNElementRef).to.equal(oldSource.businessObject);
          expect(connection.businessObject.targetCMMNElementRef).to.equal(oldTarget.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(connection.source).to.equal(oldTarget);
          expect(connection.target).to.equal(newTarget);

          expect(connection.businessObject.sourceCMMNElementRef).to.equal(oldTarget.businessObject);
          expect(connection.businessObject.targetCMMNElementRef).to.equal(newTarget.businessObject);

        }));

      });

    });

  });

});
