'use strict';


require('../../TestHelper');
var coreModule = require('../../../lib/core');

/* global bootstrapViewer, inject */


describe('ItemRegistry', function() {

  var diagramXML = require('../../fixtures/cmmn/simple.cmmn');
  var testModules = [ coreModule ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


  describe('add', function() {

    it('should wire plan item', inject(function(itemRegistry, moddle) {

      // given
      var newItem = moddle.create('cmmn:PlanItem', {
        id: 'foo',
        definitionRef: moddle.create('cmmn:HumanTask', {
          id: 'bar'
        })
      });

      // when
      itemRegistry.add(newItem);

      // then
      var item = itemRegistry.get('foo'),
          references = itemRegistry.getReferences(newItem.definitionRef);

      expect(item).to.exist;
      expect(item).to.equal(newItem);

      expect(references).to.exist;
      expect(references).to.have.length(1);
      expect(references).to.include(newItem);

    }));


    it('should wire discretionary item', inject(function(itemRegistry, moddle) {

      // given
      var newItem = moddle.create('cmmn:DiscretionaryItem', {
        id: 'foo',
        definitionRef: moddle.create('cmmn:HumanTask', {
          id: 'bar'
        })
      });

      // when
      itemRegistry.add(newItem);

      // then
      var item = itemRegistry.get('foo'),
          references = itemRegistry.getReferences(newItem.definitionRef);

      expect(item).to.exist;
      expect(item).to.equal(newItem);

      expect(references).to.exist;
      expect(references).to.have.length(1);
      expect(references).to.include(newItem);

    }));


    it('should wire case file item', inject(function(itemRegistry, moddle) {

      // given
      var newItem = moddle.create('cmmn:CaseFileItem', {
        id: 'foo',
        definitionRef: moddle.create('cmmn:CaseFileItemDefinition', {
          id: 'bar'
        })
      });

      // when
      itemRegistry.add(newItem);

      // then
      var item = itemRegistry.get('foo'),
          references = itemRegistry.getReferences(newItem.definitionRef);

      expect(item).to.exist;
      expect(item).to.equal(newItem);

      expect(references).to.exist;
      expect(references).to.have.length(1);
      expect(references).to.include(newItem);

    }));


    it('should wire criterion', inject(function(itemRegistry, moddle) {

      // given
      var newCriterion = moddle.create('cmmn:EntryCriterion', {
        id: 'foo',
        sentryRef: moddle.create('cmmn:Sentry', {
          id: 'bar'
        })
      });

      // when
      itemRegistry.add(newCriterion);

      // then
      var criterion = itemRegistry.get('foo'),
          references = itemRegistry.getReferences(newCriterion.sentryRef);

      expect(criterion).to.exist;
      expect(criterion).to.equal(newCriterion);

      expect(references).to.exist;
      expect(references).to.have.length(1);
      expect(references).to.include(newCriterion);

    }));


    it('should wire element without plan item definition', inject(function(itemRegistry, moddle) {

      // given
      var newElement = moddle.create('cmmn:Stage', {
        id: 'foo'
      });

      // when
      itemRegistry.add(newElement);

      // then
      var element = itemRegistry.get('foo'),
          references = itemRegistry.getReferences('foo');

      expect(element).to.exist;
      expect(element).to.equal(newElement);

      expect(references).to.exist;
      expect(references).to.have.length(1);
      expect(references).to.include(newElement);

    }));

  });


  describe('remove', function() {

    it('should wire element', inject(function(itemRegistry, moddle) {

      // given
      var newItem = moddle.create('cmmn:PlanItem', {
        id: 'foo',
        definitionRef: moddle.create('cmmn:HumanTask', {
          id: 'bar'
        })
      });

      itemRegistry.add(newItem);

      // when
      itemRegistry.remove(newItem);

      // then
      expect(itemRegistry.get('foo')).not.to.exist;
      expect(itemRegistry.getReferences(newItem.definitionRef)).to.be.empty;
    }));

  });


  describe('updateId', function() {

    it('should update id', inject(function(itemRegistry) {

      // given
      var oldId = 'PI_Task_1',
          newId = '56';

      var item = itemRegistry.get(oldId);

      // when
      itemRegistry.updateId(item, newId);

      // then
      expect(itemRegistry.get(oldId)).not.to.exist;
      expect(itemRegistry.get(newId)).to.exist;
    }));


    it('should update by id', inject(function(itemRegistry, canvas) {

      // given
      var oldId = 'PI_Task_1',
          newId = '56';

      // when
      itemRegistry.updateId(oldId, newId);

      // then
      expect(itemRegistry.get(oldId)).not.to.exist;
      expect(itemRegistry.get(newId)).to.exist;
    }));

  });


  describe('updateReference', function() {

    it('should update reference', inject(function(itemRegistry, moddle) {

      // given
      var item = itemRegistry.get('PI_Task_1'),
          oldReference = item.definitionRef;

      var newReference = moddle.create('cmmn:Task', {
        id: 'foo'
      });

      // when
      itemRegistry.updateReference(item, newReference);

      // then
      expect(itemRegistry.getReferences(oldReference)).to.be.empty;
      expect(itemRegistry.getReferences(newReference)).to.have.length(1);
      expect(itemRegistry.getReferences(newReference)).to.include(item);
    }));

  });


  describe('getShape', function() {

    it('should get by id', inject(function(itemRegistry) {

      // when
      var shape = itemRegistry.getShape('PI_Task_1');

      // then
      expect(shape).to.exist;
    }));


    it('should get by item', inject(function(itemRegistry, canvas) {

      // given
      var item = itemRegistry.get('PI_Task_1');

      // when
      var shape = itemRegistry.getShape(item);

      // then
      expect(shape).to.exist;
    }));

  });


  describe('getShapes', function() {

    it('should get by id', inject(function(itemRegistry) {

      // when
      var shapes = itemRegistry.getShapes('PI_Task_1');

      // then
      expect(shapes).to.have.length(1);
    }));


    it('should get by array of ids', inject(function(itemRegistry) {

      // when
      var shapes = itemRegistry.getShapes([ 'PI_Task_1' ]);

      // then
      expect(shapes).to.have.length(1);
    }));


    it('should get by definition', inject(function(itemRegistry, canvas) {

      // given
      var item = itemRegistry.get('PI_Task_1');

      // when
      var shapes = itemRegistry.getShapes(item.definitionRef);

      // then
      expect(shapes).to.have.length(1);
    }));

  });


  describe('get', function() {

    it('should get by id', inject(function(itemRegistry) {

      // when
      var item = itemRegistry.get('PI_Task_1');

      // then
      expect(item).to.exist;
      expect(item.id).to.equal('PI_Task_1');
    }));

  });


  describe('getAll', function() {

    it('should return all', inject(function(itemRegistry) {

      // when
      var elements = itemRegistry.getAll();

      // then
      // four items
      expect(elements.length).to.equal(4);
    }));

  });


  describe('filter', function() {

    it('should noop, returning all', inject(function(itemRegistry) {

      // when
      var elements = itemRegistry.filter(function(element, definition) {

        // assume we get element and definition as params
        expect(element).to.exist;
        expect(definition).to.exist;

        return true;
      });

      // then
      // four items
      expect(elements.length).to.equal(4);
    }));


    it('should filtered', inject(function(itemRegistry) {

      // when
      var elements = itemRegistry.filter(function(item, definition) {
        return item.id === 'PI_Task_1';
      });

      // then
      expect(elements.length).to.equal(1);
      expect(elements[0].id).to.equal('PI_Task_1');
    }));

  });

  describe('forEach', function() {

    it('should iterate over all', inject(function(itemRegistry) {

      // when
      var elements = [];

      itemRegistry.forEach(function(element, definition) {
        elements.push(element);
        // assume we get element and definition as params
        expect(element).to.exist;
        expect(definition).to.exist;
      });

      // then
      // four items
      expect(elements.length).to.equal(4);
    }));

  });

});
