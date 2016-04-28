'use strict';

var TestHelper = require('../../../../TestHelper');

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

});
