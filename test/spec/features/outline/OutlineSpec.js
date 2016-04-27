'use strict';

require('../../../TestHelper');

var coreModule = require('../../../../lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    outlineModule = require('../../../../lib/features/outline');

/* global bootstrapModeler, inject */


describe('features - outline', function() {

  var diagramXML = require('../../../fixtures/cmmn/simple.cmmn');

  var testModules = [ coreModule, selectionModule, outlineModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should fit case plan model height', inject(function(outline, elementRegistry, selection) {

    // given
    var casePlanModel = elementRegistry.get('CasePlanModel_1');

    // when
    selection.select(casePlanModel);

    // then
    var gfx = elementRegistry.getGraphics(casePlanModel);

    var outlineBBox = gfx.node.querySelector('.djs-outline').getBBox();

    expect(outlineBBox.y).to.equal(-24);
    expect(outlineBBox.height).to.equal(280);
  }));

});
