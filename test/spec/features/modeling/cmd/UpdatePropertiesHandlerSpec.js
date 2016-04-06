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

});
