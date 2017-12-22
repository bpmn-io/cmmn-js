'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');

var ATTACH = {
  attach: true
};


describe('features/modeling - #SentryUpdater - move', function() {

  var testModules = [ coreModule, modelingModule ];

  var sentry, newParent, oldParent;

  describe('reattach', function() {

    var diagramXML = require('./SentryUpdater.move.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('criterion to stage', function() {

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var criterion = elementRegistry.get('EntryCriterion_1');
        sentry = criterion.businessObject.sentryRef;

        oldParent = criterion.host.businessObject.$parent;

        var target = elementRegistry.get('PI_Stage_2');
        newParent = target.businessObject.$parent;

        // when
        modeling.moveElements([ criterion ], { x: -37, y: 250 }, target, ATTACH);
      }));

      it('should execute', function() {
        // when
        expect(oldParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(sentry);
        expect(sentry.$parent).to.equal(newParent);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(sentry.$parent).to.equal(oldParent);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(sentry);
        expect(sentry.$parent).to.equal(newParent);
      }));

    });


    describe('criterion to case plan model', function() {

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var criterion = elementRegistry.get('EntryCriterion_1');
        sentry = criterion.businessObject.sentryRef;

        oldParent = criterion.host.businessObject.$parent;

        var target = elementRegistry.get('CasePlanModel_1');
        newParent = target.businessObject;

        // when
        modeling.moveElements([ criterion ], { x: -67, y: 0 }, target, ATTACH);
      }));

      it('should execute', function() {
        // when
        expect(oldParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(sentry);
        expect(sentry.$parent).to.equal(newParent);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(sentry.$parent).to.equal(oldParent);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(sentry);
        expect(sentry.$parent).to.equal(newParent);
      }));

    });


    describe('criterion without sentry to stage', function() {

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var criterion = elementRegistry.get('EntryCriterion_2');

        oldParent = criterion.host.businessObject.$parent;

        var target = elementRegistry.get('PI_Stage_2');
        newParent = target.businessObject.$parent;

        // when
        modeling.moveElements([ criterion ], { x: -37, y: 180 }, target, ATTACH);
      }));

      it('should execute', function() {
        // when
        expect(oldParent.sentries).to.have.length(2);
        expect(newParent.get('sentries')).to.have.length(0);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldParent.sentries).to.have.length(2);
        expect(newParent.get('sentries')).to.have.length(0);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldParent.sentries).to.have.length(2);
        expect(newParent.get('sentries')).to.have.length(0);
      }));

    });


    describe('criterion with shared sentry to stage', function() {

      var criterion;

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var criterionShape = elementRegistry.get('EntryCriterion_3');
        criterion = criterionShape.businessObject;
        sentry = criterion.sentryRef;

        oldParent = criterionShape.host.businessObject.$parent;

        var target = elementRegistry.get('PI_Stage_2');
        newParent = target.businessObject.$parent;

        // when
        modeling.moveElements([ criterionShape ], { x: -177, y: 250 }, target, ATTACH);
      }));

      it('should execute', function() {
        // when
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(criterion.sentryRef);
        expect(criterion.sentryRef.$parent).to.equal(newParent);
      });


      it('should undo', inject(function(commandStack) {
        // given
        var newSentry = criterion.sentryRef;

        // when
        commandStack.undo();

        // then
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).not.to.include(newSentry);
        expect(newSentry.$parent).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(criterion.sentryRef);
        expect(criterion.sentryRef.$parent).to.equal(newParent);
      }));

    });

  });


  describe('move', function() {

    var diagramXML = require('./SentryUpdater.move.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('host to another stage', function() {

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var criterion = elementRegistry.get('EntryCriterion_1');
        sentry = criterion.businessObject.sentryRef;
        oldParent = criterion.host.businessObject.$parent;

        var shape = elementRegistry.get('PI_Task_1');

        var target = elementRegistry.get('PI_Stage_2');
        newParent = target.businessObject.definitionRef;

        // when
        modeling.moveElements([ shape ], { x: 0, y: 250 }, target);
      }));

      it('should execute', function() {
        // when
        expect(oldParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(sentry);
        expect(sentry.$parent).to.equal(newParent);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(sentry.$parent).to.equal(oldParent);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(sentry);
        expect(sentry.$parent).to.equal(newParent);
      }));

    });


    describe('host to case plan model', function() {

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var criterion = elementRegistry.get('EntryCriterion_1');
        sentry = criterion.businessObject.sentryRef;
        oldParent = criterion.host.businessObject.$parent;

        var shape = elementRegistry.get('PI_Task_1');

        var target = elementRegistry.get('CasePlanModel_1');
        newParent = target.businessObject;

        // when
        modeling.moveElements([ shape ], { x: 400, y: 0 }, target);
      }));

      it('should execute', function() {
        // when
        expect(oldParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(sentry);
        expect(sentry.$parent).to.equal(newParent);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(sentry.$parent).to.equal(oldParent);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(sentry);
        expect(sentry.$parent).to.equal(newParent);
      }));

    });


    describe('host with criterion without sentry to stage', function() {

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var criterion = elementRegistry.get('EntryCriterion_2');
        oldParent = criterion.host.businessObject.$parent;

        var shape = elementRegistry.get('PI_Task_2');

        var target = elementRegistry.get('PI_Stage_2');
        newParent = target.businessObject.definitionRef;

        // when
        modeling.moveElements([ shape ], { x: 0, y: 180 }, target);
      }));

      it('should execute', function() {
        // when
        expect(oldParent.sentries).to.have.length(2);
        expect(newParent.get('sentries')).to.have.length(0);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(oldParent.sentries).to.have.length(2);
        expect(newParent.get('sentries')).to.have.length(0);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldParent.sentries).to.have.length(2);
        expect(newParent.get('sentries')).to.have.length(0);
      }));

    });


    describe('host with criterion with shared sentry to stage', function() {

      var criterion;

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var criterionShape = elementRegistry.get('EntryCriterion_3');
        criterion = criterionShape.businessObject;
        sentry = criterion.sentryRef;
        oldParent = criterionShape.host.businessObject.$parent;

        var shape = elementRegistry.get('PI_Task_3');

        var target = elementRegistry.get('PI_Stage_2');
        newParent = target.businessObject.definitionRef;

        // when
        modeling.moveElements([ shape ], { x: 0, y: 250 }, target);
      }));

      it('should execute', function() {
        // when
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(criterion.sentryRef);
        expect(criterion.sentryRef.$parent).to.equal(newParent);
      });


      it('should undo', inject(function(commandStack) {
        // given
        var newSentry = criterion.sentryRef;

        // when
        commandStack.undo();

        // then
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).not.to.include(newSentry);
        expect(newSentry.$parent).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(criterion.sentryRef);
        expect(criterion.sentryRef.$parent).to.equal(newParent);
      }));

    });


    describe('multiple hosts with criterion with shared sentry to stage', function() {

      var criterion1, criterion2;

      beforeEach(inject(function(modeling, elementRegistry) {

        // given
        var criterionShape1 = elementRegistry.get('EntryCriterion_3');
        criterion1 = criterionShape1.businessObject;

        var criterionShape2 = elementRegistry.get('EntryCriterion_4');
        criterion2 = criterionShape2.businessObject;

        sentry = criterion1.sentryRef;
        oldParent = criterionShape1.host.businessObject.$parent;

        var shape1 = elementRegistry.get('PI_Task_3');
        var shape2 = elementRegistry.get('PI_Task_4');

        var target = elementRegistry.get('PI_Stage_2');
        newParent = target.businessObject.definitionRef;

        // when
        modeling.moveElements([ shape1, shape2 ], { x: 0, y: 215 }, target);
      }));

      it('should execute', function() {
        // when
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(criterion1.sentryRef);
        expect(newParent.sentries).to.include(criterion2.sentryRef);
        expect(criterion1.sentryRef.$parent).to.equal(newParent);
        expect(criterion2.sentryRef.$parent).to.equal(newParent);
        expect(criterion1.sentryRef).to.equal(criterion2.sentryRef);
      });


      it('should undo', inject(function(commandStack) {
        // given
        var newSentry = criterion1.sentryRef;

        // when
        commandStack.undo();

        // then
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).not.to.include(newSentry);
        expect(criterion1.sentryRef).to.equal(sentry);
        expect(criterion2.sentryRef).to.equal(sentry);
        expect(newSentry.$parent).not.to.exist;
        expect(criterion1.sentryRef).to.equal(criterion2.sentryRef);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(oldParent.sentries).to.include(sentry);
        expect(newParent.sentries).not.to.include(sentry);
        expect(newParent.sentries).to.include(criterion1.sentryRef);
        expect(newParent.sentries).to.include(criterion2.sentryRef);
        expect(criterion1.sentryRef.$parent).to.equal(newParent);
        expect(criterion2.sentryRef.$parent).to.equal(newParent);
        expect(criterion1.sentryRef).to.equal(criterion2.sentryRef);
      }));

    });

  });


  describe('move stage with nested discretionary task to human task', function() {

    var diagramXML = require('./SentryUpdater.move-nested-human-task.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      sentry = elementRegistry.get('EntryCriterion_1').businessObject.sentryRef;

      var shape = elementRegistry.get('PI_Stage_2');
      newParent = shape.businessObject.definitionRef;

      oldParent = elementRegistry.get('CasePlanModel_1').businessObject;

      var target = elementRegistry.get('PI_Stage_1');

      // when
      modeling.moveElements([ shape ], { x: 200, y: 255 }, target);
    }));

    it('should execute', function() {
      // when
      expect(oldParent.get('sentries')).not.to.include(sentry);
      expect(newParent.get('sentries')).to.include(sentry);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(oldParent.get('sentries')).to.include(sentry);
      expect(newParent.get('sentries')).not.to.include(sentry);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(oldParent.get('sentries')).not.to.include(sentry);
      expect(newParent.get('sentries')).to.include(sentry);
    }));

  });

  describe('move stage with nested discretionary task to human task (criterion not visible)', function() {

    var diagramXML = require('./SentryUpdater.move-nested-human-task-criterion-not-visible.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      sentry = elementRegistry.get('DIS_Task_2').businessObject.entryCriteria[0].sentryRef;

      var shape = elementRegistry.get('PI_Stage_2');
      newParent = shape.businessObject.definitionRef;

      oldParent = elementRegistry.get('CasePlanModel_1').businessObject;

      var target = elementRegistry.get('PI_Stage_1');

      // when
      modeling.moveElements([ shape ], { x: 200, y: 255 }, target);
    }));

    it('should execute', function() {
      // when
      expect(oldParent.get('sentries')).not.to.include(sentry);
      expect(newParent.get('sentries')).to.include(sentry);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(oldParent.get('sentries')).to.include(sentry);
      expect(newParent.get('sentries')).not.to.include(sentry);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(oldParent.get('sentries')).not.to.include(sentry);
      expect(newParent.get('sentries')).to.include(sentry);
    }));

  });

  describe('should duplicate case file item on parts when moving host', function() {

    var diagramXML = require('./SentryUpdater.move-shared-case-item-on-parts.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var oldOnPart, newOnPart, newSentry, connection;

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var shape = elementRegistry.get('PI_Task_2');
      var target = elementRegistry.get('PI_Stage_1');

      connection = elementRegistry.get('CaseFileItemOnPart_2_2_di').businessObject;

      sentry = elementRegistry.get('ExitCriterion_2').businessObject.sentryRef;
      oldOnPart = sentry.onParts[0];

      // when
      modeling.moveElements([ shape ], { x: 0, y: 150 }, target);

      newSentry = elementRegistry.get('ExitCriterion_2').businessObject.sentryRef;
      newOnPart = newSentry.onParts[0];

    }));

    it ('should execute', function() {
      // then
      expect(oldOnPart).not.to.equal(newOnPart);
      expect(connection.cmmnElementRef).to.equal(newOnPart);
      expect(newSentry.onParts).to.include(newOnPart);
    });


    it ('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(oldOnPart).not.to.equal(newOnPart);
      expect(connection.cmmnElementRef).to.equal(oldOnPart);
      expect(newSentry.onParts).not.to.include(newOnPart);
    }));


    it ('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(oldOnPart).not.to.equal(newOnPart);
      expect(connection.cmmnElementRef).to.equal(newOnPart);
      expect(newSentry.onParts).to.include(newOnPart);
    }));

  });


  describe('should duplicate case file item on parts when reattaching criterion', function() {

    var diagramXML = require('./SentryUpdater.move-shared-case-item-on-parts.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var oldOnPart, newOnPart, newSentry, connection;

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var criterion = elementRegistry.get('ExitCriterion_2');
      var target = elementRegistry.get('PI_Task_4');

      sentry = criterion.businessObject.sentryRef;
      oldOnPart = sentry.onParts[0];
      connection = elementRegistry.get('CaseFileItemOnPart_2_2_di').businessObject;

      // when
      modeling.moveElements([ criterion ], { x: -50, y: 135 }, target, ATTACH);

      newSentry = criterion.businessObject.sentryRef;
      newOnPart = newSentry.onParts[0];

    }));


    it ('should execute', function() {
      // then
      expect(oldOnPart).not.to.equal(newOnPart);
      expect(connection.cmmnElementRef).to.equal(newOnPart);
      expect(newSentry.onParts).to.include(newOnPart);
    });


    it ('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(oldOnPart).not.to.equal(newOnPart);
      expect(connection.cmmnElementRef).to.equal(oldOnPart);
      expect(newSentry.onParts).not.to.include(newOnPart);
    }));


    it ('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(oldOnPart).not.to.equal(newOnPart);
      expect(connection.cmmnElementRef).to.equal(newOnPart);
      expect(newSentry.onParts).to.include(newOnPart);
    }));

  });


  describe('should duplicate plan item on parts when moving host', function() {

    var diagramXML = require('./SentryUpdater.move-shared-plan-item-on-parts.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var oldOnPart, newOnPart, newSentry, connection;

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var shape = elementRegistry.get('PI_Task_2');
      var target = elementRegistry.get('PI_Stage_1');

      connection = elementRegistry.get('PlanItemOnPart_2_2_di').businessObject;

      sentry = elementRegistry.get('ExitCriterion_2').businessObject.sentryRef;
      oldOnPart = sentry.onParts[0];

      // when
      modeling.moveElements([ shape ], { x: 0, y: 150 }, target);

      newSentry = elementRegistry.get('ExitCriterion_2').businessObject.sentryRef;
      newOnPart = newSentry.onParts[0];

    }));

    it ('should execute', function() {
      // then
      expect(oldOnPart).not.to.equal(newOnPart);
      expect(connection.cmmnElementRef).to.equal(newOnPart);
      expect(newSentry.onParts).to.include(newOnPart);
    });


    it ('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(oldOnPart).not.to.equal(newOnPart);
      expect(connection.cmmnElementRef).to.equal(oldOnPart);
      expect(newSentry.onParts).not.to.include(newOnPart);
    }));


    it ('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(oldOnPart).not.to.equal(newOnPart);
      expect(connection.cmmnElementRef).to.equal(newOnPart);
      expect(newSentry.onParts).to.include(newOnPart);
    }));

  });


  describe('should duplicate plan item on parts when reattaching criterion', function() {

    var diagramXML = require('./SentryUpdater.move-shared-plan-item-on-parts.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var oldOnPart, newOnPart, newSentry, connection;

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var criterion = elementRegistry.get('ExitCriterion_2');
      var target = elementRegistry.get('PI_Task_4');

      sentry = criterion.businessObject.sentryRef;
      oldOnPart = sentry.onParts[0];
      connection = elementRegistry.get('PlanItemOnPart_2_2_di').businessObject;

      // when
      modeling.moveElements([ criterion ], { x: -50, y: 135 }, target, ATTACH);

      newSentry = criterion.businessObject.sentryRef;
      newOnPart = newSentry.onParts[0];

    }));


    it ('should execute', function() {
      // then
      expect(oldOnPart).not.to.equal(newOnPart);
      expect(connection.cmmnElementRef).to.equal(newOnPart);
      expect(newSentry.onParts).to.include(newOnPart);
    });


    it ('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(oldOnPart).not.to.equal(newOnPart);
      expect(connection.cmmnElementRef).to.equal(oldOnPart);
      expect(newSentry.onParts).not.to.include(newOnPart);
    }));


    it ('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(oldOnPart).not.to.equal(newOnPart);
      expect(connection.cmmnElementRef).to.equal(newOnPart);
      expect(newSentry.onParts).to.include(newOnPart);
    }));

  });


  describe('should not duplicate sentry when host is replaced', function() {

    var diagramXML = require('./SentryUpdater.replace.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var planFragment, sentry;

    beforeEach(inject(function(modeling, elementRegistry) {

      // given
      var shapes = [
        elementRegistry.get('PI_Task_1'),
        elementRegistry.get('PI_Task_2'),
        elementRegistry.get('DIS_Task_3')
      ];

      var target = elementRegistry.get('DIS_PlanFragment_1');
      planFragment = target.businessObject.definitionRef;

      sentry = elementRegistry.get('EntryCriterion_1').businessObject.sentryRef;

      // when
      modeling.moveElements(shapes, { x: 0, y: 225 }, target);

    }));


    it ('should execute', function() {
      // then
      expect(planFragment.get('sentries')).to.have.length(1);
      expect(planFragment.get('sentries')).to.include(sentry);
    });


    it ('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(planFragment.get('sentries')).to.be.empty;
    }));


    it ('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(planFragment.get('sentries')).to.have.length(1);
      expect(planFragment.get('sentries')).to.include(sentry);
    }));

  });

});
