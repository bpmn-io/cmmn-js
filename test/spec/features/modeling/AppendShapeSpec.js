'use strict';

/* global bootstrapModeler, inject */

var find = require('min-dash').find;


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - append shape', function() {

  describe('text annotation', function() {

    var diagramXML = require('../../../fixtures/cmmn/simple.cmmn');

    var testModules = [ coreModule, modelingModule ];
    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var source, textAnnotationShape, textAnnotation, definitions;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      source = elementRegistry.get('PI_Task_1');
      definitions = elementRegistry.get('CasePlanModel_1').businessObject.$parent.$parent;

      // when
      textAnnotationShape = modeling.appendShape(source, { type: 'cmmn:TextAnnotation' }, { x: 400, y: 150 });
      textAnnotation = textAnnotationShape.businessObject;

    }));


    describe('should create shape', function() {

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(textAnnotationShape).to.exist;
        expect(elementRegistry.get(textAnnotationShape.id)).to.exist;

        expect(textAnnotation).to.exist;
        expect(textAnnotation.$type).to.equal('cmmn:TextAnnotation');
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(textAnnotationShape.id)).not.to.exist;
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(textAnnotationShape).to.exist;
        expect(elementRegistry.get(textAnnotationShape.id)).to.exist;

        expect(textAnnotation).to.exist;
        expect(textAnnotation.$type).to.equal('cmmn:TextAnnotation');
      }));

    });


    describe('should add to parent (definitions)', function() {

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(textAnnotation.$parent).to.equal(definitions);
        expect(definitions.get('artifacts')).to.include(textAnnotation);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(textAnnotation.$parent).not.to.exist;
        expect(definitions.get('artifacts')).not.to.include(textAnnotation);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(textAnnotation.$parent).to.equal(definitions);
        expect(definitions.get('artifacts')).to.include(textAnnotation);
      }));

    });


    describe('should create DI', function() {

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(textAnnotation.di).to.exist;
        expect(textAnnotation.di.$parent).to.equal(source.businessObject.di.$parent);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(textAnnotation.di).to.exist;
        expect(textAnnotation.di.$parent).not.to.exist;
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(textAnnotation.di).to.exist;
        expect(textAnnotation.di.$parent).to.eql(source.businessObject.di.$parent);
      }));

    });


    describe('should add connection', function() {

      var connection;

      beforeEach(function() {

        connection = find(definitions.get('artifacts'), function(e) {
          return e.sourceRef === source.businessObject && e.targetRef === textAnnotation;
        });

      });

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(connection).to.exist;
        expect(connection.$type).to.equal('cmmn:Association');
        expect(connection.$parent).to.equal(definitions);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(connection).to.exist;
        expect(connection.$type).to.equal('cmmn:Association');
        expect(connection.$parent).not.to.exist;
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connection).to.exist;
        expect(connection.$type).to.equal('cmmn:Association');
        expect(connection.$parent).to.equal(definitions);
      }));

    });

  });


  describe('criterion', function() {

    var diagramXML = require('./AppendShape.criterion.cmmn');

    var testModules = [ coreModule, modelingModule ];
    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var source, target, criterionShape, criterion, sentry;

    describe('from task to task', function() {

      beforeEach(inject(function(elementRegistry, cmmnFactory, modeling) {

        // given
        source = elementRegistry.get('PI_Task_1');
        target = elementRegistry.get('PI_Task_2');

        sentry = cmmnFactory.createSentry();

        // when
        criterionShape = modeling.appendShape(source, {
          type: 'cmmn:EntryCriterion',
          sentryRef: sentry
        }, { x: 355, y: 165 }, target);
        criterion = criterionShape.businessObject;

      }));


      describe('should create shape', function() {

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(criterionShape).to.exist;
          expect(elementRegistry.get(criterionShape.id)).to.exist;

          expect(criterion).to.exist;
          expect(criterion.$type).to.equal('cmmn:EntryCriterion');
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get(criterionShape.id)).not.to.exist;
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(criterionShape).to.exist;
          expect(elementRegistry.get(criterionShape.id)).to.exist;

          expect(criterion).to.exist;
          expect(criterion.$type).to.equal('cmmn:EntryCriterion');
        }));

      });


      describe('should add to host', function() {

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(criterion.$parent).to.equal(target.businessObject);
          expect(target.businessObject.get('entryCriteria')).to.include(criterion);
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(criterion.$parent).not.to.exist;
          expect(target.businessObject.get('entryCriteria')).not.to.include(criterion);
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(criterion.$parent).to.equal(target.businessObject);
          expect(target.businessObject.get('entryCriteria')).to.include(criterion);
        }));

      });


      describe('should create DI', function() {

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(criterion.di).to.exist;
          expect(criterion.di.$parent).to.equal(source.businessObject.di.$parent);
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(criterion.di).to.exist;
          expect(criterion.di.$parent).not.to.exist;
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(criterion.di).to.exist;
          expect(criterion.di.$parent).to.eql(source.businessObject.di.$parent);
        }));

      });


      describe('should add plan item on part', function() {

        var connection;

        beforeEach(function() {
          connection = sentry.get('onParts')[0];
        });

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(connection).to.exist;
          expect(connection.$type).to.equal('cmmn:PlanItemOnPart');
          expect(connection.$parent).to.equal(sentry);
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(connection).to.exist;
          expect(connection.$type).to.equal('cmmn:PlanItemOnPart');
          expect(connection.$parent).not.to.exist;
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(connection).to.exist;
          expect(connection.$type).to.equal('cmmn:PlanItemOnPart');
          expect(connection.$parent).to.equal(sentry);
        }));

      });

    });

    describe('from case file item to task', function() {

      beforeEach(inject(function(elementRegistry, cmmnFactory, modeling) {

        // given
        source = elementRegistry.get('CaseFileItem_1');
        target = elementRegistry.get('PI_Task_2');

        sentry = cmmnFactory.createSentry();

        // when
        criterionShape = modeling.appendShape(source, {
          type: 'cmmn:EntryCriterion',
          sentryRef: sentry
        }, { x: 355, y: 165 }, target);
        criterion = criterionShape.businessObject;

      }));


      describe('should create shape', function() {

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(criterionShape).to.exist;
          expect(elementRegistry.get(criterionShape.id)).to.exist;

          expect(criterion).to.exist;
          expect(criterion.$type).to.equal('cmmn:EntryCriterion');
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(elementRegistry.get(criterionShape.id)).not.to.exist;
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(criterionShape).to.exist;
          expect(elementRegistry.get(criterionShape.id)).to.exist;

          expect(criterion).to.exist;
          expect(criterion.$type).to.equal('cmmn:EntryCriterion');
        }));

      });


      describe('should add to host', function() {

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(criterion.$parent).to.equal(target.businessObject);
          expect(target.businessObject.get('entryCriteria')).to.include(criterion);
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(criterion.$parent).not.to.exist;
          expect(target.businessObject.get('entryCriteria')).not.to.include(criterion);
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(criterion.$parent).to.equal(target.businessObject);
          expect(target.businessObject.get('entryCriteria')).to.include(criterion);
        }));

      });


      describe('should create DI', function() {

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(criterion.di).to.exist;
          expect(criterion.di.$parent).to.equal(source.businessObject.di.$parent);
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(criterion.di).to.exist;
          expect(criterion.di.$parent).not.to.exist;
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(criterion.di).to.exist;
          expect(criterion.di.$parent).to.eql(source.businessObject.di.$parent);
        }));

      });


      describe('should add plan item on part', function() {

        var connection;

        beforeEach(function() {
          connection = sentry.get('onParts')[0];
        });

        it('should execute', inject(function(elementRegistry) {
          // then
          expect(connection).to.exist;
          expect(connection.$type).to.equal('cmmn:CaseFileItemOnPart');
          expect(connection.$parent).to.equal(sentry);
        }));


        it('should undo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(connection).to.exist;
          expect(connection.$type).to.equal('cmmn:CaseFileItemOnPart');
          expect(connection.$parent).not.to.exist;
        }));


        it('should redo', inject(function(elementRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(connection).to.exist;
          expect(connection.$type).to.equal('cmmn:CaseFileItemOnPart');
          expect(connection.$parent).to.equal(sentry);
        }));

      });

    });

  });


  describe('discretionary item', function() {

    var diagramXML = require('../../../fixtures/cmmn/simple.cmmn');

    var testModules = [ coreModule, modelingModule ];
    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var source, discretionaryItemShape, discretionaryItem;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      source = elementRegistry.get('PI_Task_1');

      // when
      discretionaryItemShape = modeling.appendShape(source, {
        type: 'cmmn:DiscretionaryItem',
        definitionType: 'cmmn:Task'
      }, { x: 300, y: 150 });

      discretionaryItem = discretionaryItemShape.businessObject;

    }));


    describe('should create shape', function() {

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(discretionaryItemShape).to.exist;
        expect(elementRegistry.get(discretionaryItemShape.id)).to.exist;

        expect(discretionaryItem).to.exist;
        expect(discretionaryItem.$type).to.equal('cmmn:DiscretionaryItem');
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(elementRegistry.get(discretionaryItemShape.id)).not.to.exist;
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(discretionaryItemShape).to.exist;
        expect(elementRegistry.get(discretionaryItemShape.id)).to.exist;

        expect(discretionaryItem).to.exist;
        expect(discretionaryItem.$type).to.equal('cmmn:DiscretionaryItem');
      }));

    });


    describe('should add to parent (human task)', function() {

      it('should execute', inject(function(elementRegistry) {
        // then
        var humanTask = source.businessObject.definitionRef;
        expect(discretionaryItem.$parent).to.equal(humanTask.planningTable);
        expect(humanTask.planningTable.get('tableItems')).to.include(discretionaryItem);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // given
        var humanTask = source.businessObject.definitionRef;
        var planningTable = humanTask.planningTable;

        // when
        commandStack.undo();

        // then
        expect(discretionaryItem.$parent).not.to.exist;
        expect(humanTask.planningTable).not.to.exist;
        expect(planningTable.get('tableItems')).not.to.include(discretionaryItem);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var humanTask = source.businessObject.definitionRef;
        expect(discretionaryItem.$parent).to.equal(humanTask.planningTable);
        expect(humanTask.planningTable.get('tableItems')).to.include(discretionaryItem);
      }));

    });


    describe('should create DI', function() {

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(discretionaryItem.di).to.exist;
        expect(discretionaryItem.di.$parent).to.equal(source.businessObject.di.$parent);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(discretionaryItem.di).to.exist;
        expect(discretionaryItem.di.$parent).not.to.exist;
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(discretionaryItem.di).to.exist;
        expect(discretionaryItem.di.$parent).to.eql(source.businessObject.di.$parent);
      }));

    });


    describe('should add connection', function() {

      var connection;

      beforeEach(function() {
        connection = source.outgoing[0].businessObject;
      });

      it('should execute', inject(function(elementRegistry) {
        // then
        expect(connection).to.exist;
        expect(connection.$type).to.equal('cmmndi:CMMNEdge');
        expect(connection.cmmnElemenRef).not.to.exist;
        expect(connection.$parent).to.equal(source.businessObject.di.$parent);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(connection).to.exist;
        expect(connection.$type).to.equal('cmmndi:CMMNEdge');
        expect(connection.cmmnElemenRef).not.to.exist;
        expect(connection.$parent).not.to.exist;
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connection).to.exist;
        expect(connection.$type).to.equal('cmmndi:CMMNEdge');
        expect(connection.cmmnElemenRef).not.to.exist;
        expect(connection.$parent).to.equal(source.businessObject.di.$parent);
      }));

    });

  });

});
