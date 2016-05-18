'use strict';

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - update properties', function() {

  var diagramXML = require('../../../../fixtures/cmmn/simple.cmmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  var updatedElements;

  beforeEach(inject(function(eventBus) {

    eventBus.on([ 'commandStack.execute', 'commandStack.revert' ], function() {
      updatedElements = [];
    });

    eventBus.on('element.changed', function(event) {
      updatedElements.push(event.element);
    });

  }));

  describe('setting name', function() {

    var taskShape, task;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      taskShape = elementRegistry.get('PI_Task_1');
      task = taskShape.businessObject;

      // when
      modeling.updateProperties(taskShape, { name: 'foo' });
    }));

    it('should execute', function() {
      // then
      expect(task.name).to.equal('foo');
      expect(updatedElements).to.include(taskShape);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(task.name).not.to.exist;
      expect(updatedElements).to.include(taskShape);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(task.name).to.equal('foo');
      expect(updatedElements).to.include(taskShape);
    }));

  });


  describe('setting definitionRef', function() {

    var taskShape, task, oldDefinition, newDefinition;

    beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {
      // given
      taskShape = elementRegistry.get('PI_Task_1');
      task = taskShape.businessObject;

      oldDefinition = task.definitionRef;

      newDefinition = cmmnFactory.create('cmmn:Task');

      // when
      modeling.updateProperties(taskShape, { definitionRef: newDefinition });
    }));

    it('should execute', function() {
      // then
      expect(task.definitionRef).to.equal(newDefinition);
      expect(updatedElements).to.include(taskShape);
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(task.definitionRef).to.equal(oldDefinition);
      expect(updatedElements).to.include(taskShape);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(task.definitionRef).to.equal(newDefinition);
      expect(updatedElements).to.include(taskShape);
    }));

  });


  describe('setting id', function() {

    var task, taskShape, ids;

    beforeEach(inject(function(elementRegistry, modeling) {
      // given
      taskShape = elementRegistry.get('PI_Task_1');
      task = taskShape.businessObject;
      ids = task.$model.ids;

      // when
      modeling.updateProperties(taskShape, { id: 'FOO_BAR' });
    }));

    it('should execute', function() {
      // then
      expect(ids.assigned('FOO_BAR')).to.eql(task);
      expect(ids.assigned('PI_Task_1')).to.be.false;

      expect(task.id).to.equal('FOO_BAR');
      expect(taskShape.id).to.equal('FOO_BAR');
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(ids.assigned('FOO_BAR')).to.be.false;
      expect(ids.assigned('PI_Task_1')).to.eql(task);

      expect(task.id).to.equal('PI_Task_1');
      expect(taskShape.id).to.equal('PI_Task_1');
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(ids.assigned('FOO_BAR')).to.eql(task);
      expect(ids.assigned('PI_Task_1')).to.be.false;

      expect(task.id).to.equal('FOO_BAR');
      expect(taskShape.id).to.equal('FOO_BAR');
    }));

  });


  describe('update itemRegistry', function() {

    describe('when setting id', function() {

      describe('of an item', function() {

        var task;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var taskShape = elementRegistry.get('PI_Task_1');
          task = taskShape.businessObject;

          // when
          modeling.updateProperties(taskShape, { id: 'FOO_BAR' });
        }));


        it('should execute', inject(function(itemRegistry) {
          // then
          expect(itemRegistry.get('FOO_BAR')).to.exist;
          expect(itemRegistry.get('FOO_BAR')).to.equal(task);

          expect(itemRegistry.get('PI_Task_1')).not.to.exist;
        }));


        it('should undo', inject(function(itemRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(itemRegistry.get('FOO_BAR')).not.to.exist;

          expect(itemRegistry.get('PI_Task_1')).to.exist;
          expect(itemRegistry.get('PI_Task_1')).to.equal(task);
        }));


        it('should redo', inject(function(itemRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(itemRegistry.get('FOO_BAR')).to.exist;
          expect(itemRegistry.get('FOO_BAR')).to.equal(task);

          expect(itemRegistry.get('PI_Task_1')).not.to.exist;
        }));

      });


      describe('of a definition', function() {

        var definition, task;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var taskShape = elementRegistry.get('PI_Task_1');
          task = taskShape.businessObject;
          definition = task.definitionRef;

          // when
          modeling.updateProperties(definition, { id: 'FOO_BAR' }, taskShape);
        }));


        it('should execute', inject(function(itemRegistry) {
          // then
          expect(itemRegistry.getReferences('FOO_BAR')).to.have.length(1);
          expect(itemRegistry.getReferences('FOO_BAR')).to.include(task);

          expect(itemRegistry.getReferences('Task_1')).to.be.empty;
        }));


        it('should undo', inject(function(itemRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(itemRegistry.getReferences('Task_1')).to.have.length(1);
          expect(itemRegistry.getReferences('Task_1')).to.include(task);

          expect(itemRegistry.getReferences('FOO_BAR')).to.be.empty;
        }));


        it('should redo', inject(function(itemRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(itemRegistry.getReferences('FOO_BAR')).to.have.length(1);
          expect(itemRegistry.getReferences('FOO_BAR')).to.include(task);

          expect(itemRegistry.getReferences('Task_1')).to.be.empty;
        }));

      });


      describe('of a sentry', function() {

        var sentry, criterion;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          var criterionShape = elementRegistry.get('EntryCriterion_1');
          criterion = criterionShape.businessObject;
          sentry = criterion.sentryRef;

          // when
          modeling.updateProperties(sentry, { id: 'FOO_BAR' }, criterionShape);
        }));


        it('should execute', inject(function(itemRegistry) {
          // then
          expect(itemRegistry.getReferences('FOO_BAR')).to.have.length(1);
          expect(itemRegistry.getReferences('FOO_BAR')).to.include(criterion);

          expect(itemRegistry.getReferences('Sentry_1')).to.be.empty;
        }));


        it('should undo', inject(function(itemRegistry, commandStack) {
          // when
          commandStack.undo();

          // then
          expect(itemRegistry.getReferences('Sentry_1')).to.have.length(1);
          expect(itemRegistry.getReferences('Sentry_1')).to.include(criterion);

          expect(itemRegistry.getReferences('FOO_BAR')).to.be.empty;
        }));


        it('should redo', inject(function(itemRegistry, commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(itemRegistry.getReferences('FOO_BAR')).to.have.length(1);
          expect(itemRegistry.getReferences('FOO_BAR')).to.include(criterion);

          expect(itemRegistry.getReferences('Sentry_1')).to.be.empty;
        }));

      });

    });


    describe('when setting definitionRef', function() {

      var oldDefinition, newDefinition, task;

      beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

        // given
        var taskShape = elementRegistry.get('PI_Task_1');
        task = taskShape.businessObject;
        oldDefinition = task.definitionRef;

        newDefinition = cmmnFactory.create('cmmn:HumanTask', {
          id: 'FOO_BAR'
        });

        // when
        modeling.updateProperties(taskShape, {
          definitionRef: newDefinition
        });

      }));


      it('should execute', inject(function(itemRegistry) {
        // then
        expect(itemRegistry.getReferences('FOO_BAR')).to.have.length(1);
        expect(itemRegistry.getReferences('FOO_BAR')).to.include(task);

        expect(itemRegistry.getReferences('Task_1')).to.be.empty;
      }));


      it('should undo', inject(function(itemRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(itemRegistry.getReferences('FOO_BAR')).to.be.empty

        expect(itemRegistry.getReferences('Task_1')).to.have.length(1);
        expect(itemRegistry.getReferences('Task_1')).to.include(task);
      }));


      it('should redo', inject(function(itemRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(itemRegistry.getReferences('FOO_BAR')).to.have.length(1);
        expect(itemRegistry.getReferences('FOO_BAR')).to.include(task);

        expect(itemRegistry.getReferences('Task_1')).to.be.empty;
      }));

    });


    describe('when setting sentryRef', function() {

      var oldSentry, newSentry, criterion;

      beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

        // given
        var criterionShape = elementRegistry.get('EntryCriterion_1');
        criterion = criterionShape.businessObject;
        oldSentry = criterion.sentryRef;

        newSentry = cmmnFactory.create('cmmn:Sentry', {
          id: 'FOO_BAR'
        });

        // when
        modeling.updateProperties(criterionShape, {
          sentryRef: newSentry
        });

      }));


      it('should execute', inject(function(itemRegistry) {
        // then
        expect(itemRegistry.getReferences('FOO_BAR')).to.have.length(1);
        expect(itemRegistry.getReferences('FOO_BAR')).to.include(criterion);

        expect(itemRegistry.getReferences('Sentry_1')).to.be.empty;
      }));


      it('should undo', inject(function(itemRegistry, commandStack) {
        // when
        commandStack.undo();

        // then
        expect(itemRegistry.getReferences('FOO_BAR')).to.be.empty;

        expect(itemRegistry.getReferences('Sentry_1')).to.have.length(1);
        expect(itemRegistry.getReferences('Sentry_1')).to.include(criterion);
      }));


      it('should redo', inject(function(itemRegistry, commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(itemRegistry.getReferences('FOO_BAR')).to.have.length(1);
        expect(itemRegistry.getReferences('FOO_BAR')).to.include(criterion);

        expect(itemRegistry.getReferences('Sentry_1')).to.be.empty;
      }));

    });

  });

});
