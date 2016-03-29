'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


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

  });

});
