'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #SentryUpdater - case file item on part', function() {

  var testModules = [ coreModule, modelingModule ];

  var diagramXML = require('./SentryUpdater.case-file-item-on-part.cmmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  var onPart, sourceSentry, targetSentry;

  describe('delete', function() {

    describe('simple', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var connection = elementRegistry.get('CaseFileItemOnPart_1_di');
        onPart = connection.businessObject.cmmnElementRef;

        targetSentry = connection.target.businessObject.sentryRef;

        // when
        modeling.removeConnection(connection);

      }));


      it('should execute', function() {
        // then
        expect(targetSentry.get('onParts')).not.to.include(onPart);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(targetSentry.get('onParts')).to.include(onPart);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(targetSentry.get('onParts')).not.to.include(onPart);
      }));

    });

    describe('shared on part', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var connection = elementRegistry.get('CaseFileItemOnPart_2_1_di');
        onPart = connection.businessObject.cmmnElementRef;

        targetSentry = connection.target.businessObject.sentryRef;

        // when
        modeling.removeConnection(connection);

      }));


      it('should execute', function() {
        // then
        expect(targetSentry.get('onParts')).to.include(onPart);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(targetSentry.get('onParts')).to.include(onPart);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(targetSentry.get('onParts')).to.include(onPart);
      }));

    });

  });


  describe('create', function() {

    describe('simple', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var sourceShape = elementRegistry.get('CaseFileItem_2');
        var targetShape = elementRegistry.get('ExitCriterion_2');

        targetSentry = targetShape.businessObject.sentryRef;

        // when
        var connection = modeling.connect(sourceShape, targetShape, { type: 'cmmn:CaseFileItemOnPart' });

        onPart = connection.businessObject.cmmnElementRef;

      }));


      it('should execute', function() {
        // then
        expect(targetSentry.get('onParts')).to.include(onPart);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(targetSentry.get('onParts')).not.to.include(onPart);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(targetSentry.get('onParts')).to.include(onPart);
      }));

    });

    describe('create sentry', function() {

      var criterion;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var sourceShape = elementRegistry.get('CaseFileItem_2');
        var targetShape = elementRegistry.get('ExitCriterion_5');

        criterion = targetShape.businessObject;

        // when
        var connection = modeling.connect(sourceShape, targetShape, { type: 'cmmn:CaseFileItemOnPart' });

        onPart = connection.businessObject.cmmnElementRef;

      }));


      it('should execute', function() {
        // then
        expect(criterion.sentryRef).to.exist;
        expect(criterion.sentryRef.get('onParts')).to.include(onPart);
      });


      it('should undo', inject(function(commandStack) {
        // given
        var sentry = criterion.sentryRef;

        // when

        commandStack.undo();

        // then
        expect(criterion.sentryRef).not.to.exist;
        expect(sentry.get('onParts')).not.to.include(onPart);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(criterion.sentryRef).to.exist;
        expect(criterion.sentryRef.get('onParts')).to.include(onPart);
      }));

    });

    describe('create sentry', function() {

      var criterion;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var sourceShape = elementRegistry.get('CaseFileItem_2');
        var targetShape = elementRegistry.get('ExitCriterion_5');

        criterion = targetShape.businessObject;

        // when
        var connection = modeling.connect(sourceShape, targetShape, { type: 'cmmn:CaseFileItemOnPart' });

        onPart = connection.businessObject.cmmnElementRef;

      }));


      it('should execute', function() {
        // then
        expect(criterion.sentryRef).to.exist;
        expect(criterion.sentryRef.get('onParts')).to.include(onPart);
      });


      it('should undo', inject(function(commandStack) {
        // given
        var sentry = criterion.sentryRef;

        // when
        commandStack.undo();

        // then
        expect(criterion.sentryRef).not.to.exist;
        expect(sentry.get('onParts')).not.to.include(onPart);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(criterion.sentryRef).to.exist;
        expect(criterion.sentryRef.get('onParts')).to.include(onPart);
      }));

    });

  });


  describe('reconnectStart', function() {

    describe('simple', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var connection = elementRegistry.get('CaseFileItemOnPart_1_di');
        onPart = connection.businessObject.cmmnElementRef;

        var sourceShape = elementRegistry.get('CaseFileItem_2');

        targetSentry = connection.target.businessObject.sentryRef;

        var newWaypoints = [{
          x: sourceShape.x + 100,
          y: sourceShape.y + 40
        }, connection.waypoints[1]];

        // when
        modeling.reconnectStart(connection, sourceShape, newWaypoints);

      }));


      it('should execute', function() {
        // then
        expect(targetSentry.get('onParts')).to.include(onPart);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(targetSentry.get('onParts')).to.include(onPart);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(targetSentry.get('onParts')).to.include(onPart);
      }));

    });


    describe('shared on part', function() {

      var newOnPart, connection;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        connection = elementRegistry.get('CaseFileItemOnPart_2_1_di');
        onPart = connection.businessObject.cmmnElementRef;

        var sourceShape = elementRegistry.get('CaseFileItem_2');

        targetSentry = connection.target.businessObject.sentryRef;

        var newWaypoints = [{
          x: sourceShape.x + 100,
          y: sourceShape.y + 40
        }, connection.waypoints[1]];

        // when
        modeling.reconnectStart(connection, sourceShape, newWaypoints);

        newOnPart = connection.businessObject.cmmnElementRef;

      }));


      it('should execute', function() {
        // then
        expect(targetSentry.get('onParts')).to.have.length(2);
        expect(targetSentry.get('onParts')).to.include(onPart);
        expect(targetSentry.get('onParts')).to.include(newOnPart);

        expect(onPart).not.to.equal(newOnPart);

        expect(connection.businessObject.cmmnElementRef).to.equal(newOnPart);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(targetSentry.get('onParts')).to.have.length(1);
        expect(targetSentry.get('onParts')).to.include(onPart);
        expect(targetSentry.get('onParts')).not.to.include(newOnPart);

        expect(onPart).not.to.equal(newOnPart);

        expect(connection.businessObject.cmmnElementRef).to.equal(onPart);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(targetSentry.get('onParts')).to.have.length(2);
        expect(targetSentry.get('onParts')).to.include(onPart);
        expect(targetSentry.get('onParts')).to.include(newOnPart);

        expect(onPart).not.to.equal(newOnPart);

        expect(connection.businessObject.cmmnElementRef).to.equal(newOnPart);
      }));

    });

  });


  describe('reconnectEnd', function() {

    describe('simple', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var connection = elementRegistry.get('CaseFileItemOnPart_1_di');
        onPart = connection.businessObject.cmmnElementRef;

        var targetShape = elementRegistry.get('ExitCriterion_2');

        sourceSentry = connection.target.businessObject.sentryRef;
        targetSentry = targetShape.businessObject.sentryRef;

        var newWaypoints = [
          connection.waypoints[0],
          {
            x: targetShape.x,
            y: targetShape.y + 14
          }
        ];

        // when
        modeling.reconnectEnd(connection, targetShape, newWaypoints);

      }));


      it('should execute', function() {
        // then
        expect(sourceSentry.get('onParts')).not.to.include(onPart);
        expect(targetSentry.get('onParts')).to.include(onPart);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(sourceSentry.get('onParts')).to.include(onPart);
        expect(targetSentry.get('onParts')).not.to.include(onPart);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(sourceSentry.get('onParts')).not.to.include(onPart);
        expect(targetSentry.get('onParts')).to.include(onPart);
      }));

    });

    describe('create sentry', function() {

      var criterion;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        var connection = elementRegistry.get('CaseFileItemOnPart_1_di');
        onPart = connection.businessObject.cmmnElementRef;

        var targetShape = elementRegistry.get('ExitCriterion_5');

        criterion = targetShape.businessObject;

        sourceSentry = connection.target.businessObject.sentryRef;

        var newWaypoints = [
          connection.waypoints[0],
          {
            x: targetShape.x,
            y: targetShape.y + 14
          }
        ];

        // when
        modeling.reconnectEnd(connection, targetShape, newWaypoints);

      }));


      it('should execute', function() {
        // then
        expect(criterion.sentryRef).to.exist;
        expect(criterion.sentryRef.get('onParts')).to.include(onPart);

        expect(sourceSentry.get('onParts')).not.to.include(onPart);
      });


      it('should undo', inject(function(commandStack) {
        // given
        var targetSentry = criterion.sentryRef;

        // when

        commandStack.undo();

        // then
        expect(criterion.sentryRef).not.to.exist;

        expect(sourceSentry.get('onParts')).to.include(onPart);
        expect(targetSentry.get('onParts')).not.to.include(onPart);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(criterion.sentryRef).to.exist;
        expect(criterion.sentryRef.get('onParts')).to.include(onPart);

        expect(sourceSentry.get('onParts')).not.to.include(onPart);
      }));

    });


    describe('shared on part', function() {

      var newOnPart, connection;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        connection = elementRegistry.get('CaseFileItemOnPart_2_1_di');
        onPart = connection.businessObject.cmmnElementRef;

        var targetShape = elementRegistry.get('ExitCriterion_2');

        sourceSentry = connection.target.businessObject.sentryRef;
        targetSentry = targetShape.businessObject.sentryRef;

        var newWaypoints = [
          connection.waypoints[0],
          {
            x: targetShape.x,
            y: targetShape.y + 14
          }
        ];

        // when
        modeling.reconnectEnd(connection, targetShape, newWaypoints);

        newOnPart = connection.businessObject.cmmnElementRef;

      }));


      it('should execute', function() {
        // then
        expect(sourceSentry.get('onParts')).to.have.length(1);
        expect(sourceSentry.get('onParts')).to.include(onPart);

        expect(targetSentry.get('onParts')).to.have.length(1);
        expect(targetSentry.get('onParts')).to.include(newOnPart);

        expect(onPart).not.to.equal(newOnPart);

        expect(connection.businessObject.cmmnElementRef).to.equal(newOnPart);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(sourceSentry.get('onParts')).to.have.length(1);
        expect(sourceSentry.get('onParts')).to.include(onPart);

        expect(targetSentry.get('onParts')).to.have.length(0);
        expect(targetSentry.get('onParts')).not.to.include(newOnPart);

        expect(onPart).not.to.equal(newOnPart);

        expect(connection.businessObject.cmmnElementRef).to.equal(onPart);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(sourceSentry.get('onParts')).to.have.length(1);
        expect(sourceSentry.get('onParts')).to.include(onPart);

        expect(targetSentry.get('onParts')).to.have.length(1);
        expect(targetSentry.get('onParts')).to.include(newOnPart);

        expect(onPart).not.to.equal(newOnPart);

        expect(connection.businessObject.cmmnElementRef).to.equal(newOnPart);
      }));

    });

  });

});
