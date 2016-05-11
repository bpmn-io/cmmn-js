'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling/behavior - replace element', function() {

  var testModules = [ coreModule, modelingModule ];

  var diagramXML = require('./ReplaceElementBehavior.cmmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules.concat(modelingModule) }));


  it('should execute on attach', inject(function(elementRegistry, elementFactory, modeling) {

    // given
    var casePlanModel = elementRegistry.get('CasePlanModel_1'),
        entryCriterion = elementFactory.createCriterionShape('cmmn:EntryCriterion');

    // when
    var newCriterion = modeling.createShape(entryCriterion, { x: 107, y: 100 }, casePlanModel, true);

    // then
    expect(newCriterion.type).to.equal('cmmn:ExitCriterion');
    expect(newCriterion.businessObject.$parent).to.equal(casePlanModel.businessObject);
    expect(casePlanModel.businessObject.exitCriteria).to.include(newCriterion.businessObject);
  }));


  it('should NOT execute on attach to task', inject(function(elementRegistry, elementFactory, modeling) {

    // given
    var task = elementRegistry.get('PI_Task_1'),
        entryCriterion = elementFactory.createCriterionShape('cmmn:EntryCriterion');

    // when
    var newCriterion = modeling.createShape(entryCriterion, { x: 239, y: 150 }, task, true);

    // then
    expect(newCriterion.type).to.equal('cmmn:EntryCriterion');
    expect(newCriterion.businessObject.$parent).to.equal(task.businessObject);
    expect(task.businessObject.entryCriteria).to.include(newCriterion.businessObject);
  }));


  it('should execute on reattach to case plan model', inject(function(elementRegistry, modeling) {

    // given
    var casePlanModel = elementRegistry.get('CasePlanModel_1'),
        entryCriterion = elementRegistry.get('EntryCriterion_1'),
        sentry = entryCriterion.businessObject.sentryRef;

    // when
    modeling.moveElements([ entryCriterion ], { x: 170, y: 0 }, casePlanModel, true);


    var replacement = elementRegistry.filter(function(element) {
      if(element.businessObject && element.businessObject.sentryRef === sentry) {
        return true;
      }
    })[0];

    // then
    expect(replacement.type).to.equal('cmmn:ExitCriterion');
    expect(replacement.businessObject.$parent).to.equal(casePlanModel.businessObject);
    expect(casePlanModel.businessObject.exitCriteria).to.include(replacement.businessObject);

  }));


  it('should NOT execute on reattach to milestone', inject(function(elementRegistry, modeling) {

    // given
    var milestone = elementRegistry.get('PI_Milestone_1'),
        entryCriterion = elementRegistry.get('EntryCriterion_1'),
        sentry = entryCriterion.businessObject.sentryRef;

    // when
    modeling.moveElements([ entryCriterion ], { x: -10, y: 100 }, milestone, true);


    var criterion = elementRegistry.filter(function(element) {
      if(element.businessObject && element.businessObject.sentryRef === sentry) {
        return true;
      }
    })[0];

    // then
    expect(criterion.type).to.equal('cmmn:EntryCriterion');
    expect(criterion.businessObject.$parent).to.equal(milestone.businessObject);
    expect(milestone.businessObject.entryCriteria).to.include(criterion.businessObject);

  }));


  it('should NOT execute on simple host movement', inject(function(elementRegistry, modeling) {

    // given
    var task = elementRegistry.get('PI_Task_1'),
        entryCriterion = elementRegistry.get('EntryCriterion_1');

    // when
    modeling.moveElements([ task, entryCriterion ], { x: 10, y: 30 }, task.parent);


    // then
    expect(elementRegistry.get('EntryCriterion_1')).to.exist;

    expect(task.attachers).to.have.length(2);
    expect(task.attachers).to.include(entryCriterion);
  }));


  describe('replace exit criterion when setting task non-blocking', function() {

    var element, newCriterion, oldCriterion;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      element = elementRegistry.get('PI_Task_1');
      oldCriterion = elementRegistry.get('ExitCriterion_2');

      // when
      modeling.updateControls(element, { isBlocking: false });

      var sentry = oldCriterion.businessObject.sentryRef;
      newCriterion = elementRegistry.filter(function(element) {
        if(element.businessObject && element.businessObject.sentryRef === sentry) {
          return true;
        }
      })[0];

    }));


    it('should execute', function() {
      // then
      expect(newCriterion.type).to.equal('cmmn:EntryCriterion');
      expect(newCriterion.host).to.equal(element);

      expect(oldCriterion.host).not.to.exist;
    });


    it('should undo', inject(function(commandStack) {
      // when
      commandStack.undo();

      // then
      expect(newCriterion.host).not.to.exist;

      expect(oldCriterion.host).to.equal(element);
    }));


    it('should redo', inject(function(commandStack) {
      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(newCriterion.type).to.equal('cmmn:EntryCriterion');
      expect(newCriterion.host).to.equal(element);

      expect(oldCriterion.host).not.to.exist;
    }));

  });

});
