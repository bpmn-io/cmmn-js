'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    providerModule = require('../../../../lib/features/global-connect'),
    coreModule = require('../../../../lib/core');


describe('features/cmmn-global-connect-provider', function() {

  var diagramXML = require('../../../fixtures/cmmn/simple.cmmn');

  var testModules = [ coreModule, modelingModule, providerModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should allow start for given element types', inject(function(cmmnGlobalConnect, elementFactory) {
    // given
    var types = [
      'cmmn:CaseFileItem',
      'cmmn:Criterion',
      'cmmn:DiscretionaryItem',
      'cmmn:PlanItem'
    ];

    // when
    var results = types.map(function(type) {
      var e = elementFactory.createShape({ type: type });
      return cmmnGlobalConnect.canStartConnect(e);
    });

    // then
    results.forEach(function(r) {
      expect(r).to.be.true;
    });
  }));


  it('should ignore label elements', inject(function(canvas, cmmnGlobalConnect, modeling, elementFactory) {
    // given
    var label = elementFactory.createShape({
      type: 'cmmn:PlanItem',
      definitionTye: 'cmmn:EventListener',
      labelTarget: {}
    });

    // when
    var result = cmmnGlobalConnect.canStartConnect(label);

    // then
    expect(result).to.be.null;
  }));


  it('should NOT allow start on unknown element', inject(function(cmmnGlobalConnect) {
    // when
    var result = cmmnGlobalConnect.canStartConnect({ type: 'cmmn:SomeUnknownType' });

    // then
    expect(result).to.be.false;
  }));

});
