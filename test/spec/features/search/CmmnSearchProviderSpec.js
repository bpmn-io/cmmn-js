'use strict';

var coreModule = require('../../../../lib/core'),
    modelingModule = require('../../../../lib/features/modeling'),
    cmmnSearchModule = require('../../../../lib/features/search');

/* global bootstrapViewer, inject */

describe('features - CMMN search provider', function() {

  var testModules = [
    coreModule,
    modelingModule,
    cmmnSearchModule
  ];

  var diagramXML = require('./CmmnSearchProvider.cmmn');

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


  it('find should return all elements that match label or ID', inject(function(cmmnSearch) {
    // given
    var pattern = '123456';

    // when
    var elements = cmmnSearch.find(pattern);

    // then
    expect(elements).length(3);
    elements.forEach(function(e) {
      expect(e).to.have.property('element');
      expect(e).to.have.property('primaryTokens');
      expect(e).to.have.property('secondaryTokens');
    });
  }));


  it('matches IDs', inject(function(cmmnSearch) {
    // given
    var pattern = 'planitemtask';

    // when
    var elements = cmmnSearch.find(pattern);

    // then
    expect(elements[0].primaryTokens).to.eql([
      { normal: 'has matched ID' }
    ]);
    expect(elements[0].secondaryTokens).to.eql([
      { normal: 'some_' },
      { matched: 'PlanItemTask' },
      { normal: '_123456_id' }
    ]);
  }));


  describe('should split result into matched and non matched tokens', function() {

    it('matched all', inject(function(cmmnSearch) {
      // given
      var pattern = 'all matched';

      // when
      var elements = cmmnSearch.find(pattern);

      // then
      expect(elements[0].primaryTokens).to.eql([
        { matched: 'all matched' }
      ]);
    }));


    it('matched start', inject(function(cmmnSearch) {
      // given
      var pattern = 'before';

      // when
      var elements = cmmnSearch.find(pattern);

      // then
      expect(elements[0].primaryTokens).to.eql([
        { matched: 'before' },
        { normal: ' 321' }
      ]);
    }));


    it('matched middle', inject(function(cmmnSearch) {
      // given
      var pattern = 'middle';

      // when
      var elements = cmmnSearch.find(pattern);

      // then
      expect(elements[0].primaryTokens).to.eql([
        { normal: '123 ' },
        { matched: 'middle' },
        { normal: ' 321' }
      ]);
    }));


    it('matched end', inject(function(cmmnSearch) {
      // given
      var pattern = 'after';

      // when
      var elements = cmmnSearch.find(pattern);

      // then
      expect(elements[0].primaryTokens).to.eql([
        { normal: '123 ' },
        { matched: 'after' }
      ]);
    }));

  });

});
