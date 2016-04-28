'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');

var forEach = require('lodash/collection/forEach');

describe('features/modeling CmmnFactory', function() {

  var testModules = [ coreModule, modelingModule ];

  var testXML = require('../../../fixtures/cmmn/simple.cmmn');

  beforeEach(bootstrapModeler(testXML, { modules: testModules }));

  describe('create element', function() {

    it('should create plan item', inject(function(cmmnFactory) {

      // when
      var planItem = cmmnFactory.createItem('cmmn:PlanItem', 'cmmn:Stage');

      // then
      expect(planItem).to.exist;
      expect(planItem.$type).to.equal('cmmn:PlanItem');

      expect(planItem.definitionRef).to.exist;
      expect(planItem.definitionRef.$type).to.equal('cmmn:Stage');
    }));


    it('should create discretionary item', inject(function(cmmnFactory) {

      // when
      var discretionaryItem = cmmnFactory.createItem('cmmn:DiscretionaryItem', 'cmmn:Stage');

      // then
      expect(discretionaryItem).to.exist;
      expect(discretionaryItem.$type).to.equal('cmmn:DiscretionaryItem');

      expect(discretionaryItem.definitionRef).to.exist;
      expect(discretionaryItem.definitionRef.$type).to.equal('cmmn:Stage');
    }));


    it('should create case plan model', inject(function(cmmnFactory) {

      // when
      var casePlanModel = cmmnFactory.createCasePlanModel();

      // then
      expect(casePlanModel).to.exist;
      expect(casePlanModel.$type).to.equal('cmmn:Stage');

      expect(casePlanModel.$parent).to.exist;
      expect(casePlanModel.$parent.$type).to.equal('cmmn:Case');

      expect(casePlanModel.$parent.casePlanModel).to.exist;
      expect(casePlanModel.$parent.casePlanModel).to.equal(casePlanModel);
    }));


    it('should create entry criterion', inject(function(cmmnFactory) {

      // when
      var entryCriterion = cmmnFactory.createCriterion('cmmn:EntryCriterion');

      // then
      expect(entryCriterion).to.exist;
      expect(entryCriterion.$type).to.equal('cmmn:EntryCriterion');

      expect(entryCriterion.sentryRef).to.exist;
      expect(entryCriterion.sentryRef.$type).to.equal('cmmn:Sentry');
    }));


    it('should create exit criterion', inject(function(cmmnFactory) {

      // when
      var exitCriterion = cmmnFactory.createCriterion('cmmn:ExitCriterion');

      // then
      expect(exitCriterion).to.exist;
      expect(exitCriterion.$type).to.equal('cmmn:ExitCriterion');

      expect(exitCriterion.sentryRef).to.exist;
      expect(exitCriterion.sentryRef.$type).to.equal('cmmn:Sentry');
    }));


    it('should set sentryRef to given sentry', inject(function(cmmnFactory) {

      // given
      var sentry = cmmnFactory.createSentry();

      // when
      var exitCriterion = cmmnFactory.createCriterion('cmmn:ExitCriterion', {
        sentryRef: sentry
      });

      // then
      expect(exitCriterion).to.exist;
      expect(exitCriterion.$type).to.equal('cmmn:ExitCriterion');

      expect(exitCriterion.sentryRef).to.exist;
      expect(exitCriterion.sentryRef).to.equal(sentry);
    }));


    it('should set label when creating shape', inject(function(cmmnFactory) {

      // when
      var shape = cmmnFactory.createDiShape(shape, {
        x: 100,
        y: 100,
        width: 100,
        height: 80
      });

      // then
      expect(shape.label).to.exist;
    }));


    it('should set label when creating edge', inject(function(cmmnFactory) {

      // when
      var edge = cmmnFactory.createDiEdge(null, [
        { x: 100, y: 100 },
        { x: 110, y: 110 }
      ]);

      // then
      expect(edge.label).to.exist;

    }));

    it('should generate id', inject(function(cmmnFactory) {

      var types = [
        'cmmn:Case',
        'cmmn:PlanFragment',
        'cmmn:Stage',
        'cmmn:Task',
        'cmmn:HumanTask',
        'cmmn:ProcessTask',
        'cmmn:CaseTask',
        'cmmn:DecisionTask',
        'cmmn:Milestone',
        'cmmn:EventListener',
        'cmmn:UserEventListener',
        'cmmn:TimerEventListener',
        'cmmn:PlanningTable',
        'cmmn:DiscretionaryItem',
        'cmmn:PlanItem',
        'cmmn:RepetitionRule',
        'cmmn:RequiredRule',
        'cmmn:ManualActivationRule',
        'cmmn:Sentry',
        'cmmn:EntryCriterion',
        'cmmn:ExitCriterion',
        'cmmn:PlanItemOnPart',
        'cmmn:CaseFileItemOnPart',
        'cmmn:CaseFileItem',
        'cmmn:CaseFileItemDefinition',
        'cmmn:Definitions',
        'cmmn:Documentation',
        'cmmndi:CMMNDiagram',
        'cmmndi:CMMNShape',
        'cmmndi:CMMNEdge',
        'cmmndi:CMMNStyle'
      ];

      forEach(types, function(type) {

        // when
        var elem = cmmnFactory.create(type);

        // then
        expect(elem.id).to.exist;

      });

    }));


    it('should NOT generate id', inject(function(cmmnFactory) {


      var types = [
        'dc:Bounds',
        'dc:Point',
        'cmmndi:CMMNLabel'
      ];

      forEach(types, function(type) {

        // when
        var elem = cmmnFactory.create(type);

        // then
        expect(elem.id).not.to.exist;

      });

    }));

  });

});
