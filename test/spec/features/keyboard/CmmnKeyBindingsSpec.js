'use strict';

var TestContainer = require('mocha-test-container-support');

var coreModule = require('../../../../lib/core'),
    modelingModule = require('../../../../lib/features/modeling'),
    keyboardModule = require('../../../../lib/features/keyboard'),
    spaceToolModule = require('diagram-js/lib/features/space-tool'),
    lassoToolModule = require('diagram-js/lib/features/lasso-tool'),
    handToolModule = require('diagram-js/lib/features/hand-tool');

var createKeyEvent = require('diagram-js/test/util/KeyEvents').createKeyEvent;

/* global bootstrapViewer, inject, sinon */

describe('features - keyboard', function() {

  var diagramXML = require('../../../fixtures/cmmn/simple.cmmn');

  var testModules = [
    coreModule,
    modelingModule,
    spaceToolModule,
    lassoToolModule,
    handToolModule,
    keyboardModule
  ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));

  describe('cmmn key bindings', function() {

    var container;

    beforeEach(function() {
      container = TestContainer.get(this);
    });


    it('should trigger lasso tool', inject(function(keyboard, lassoTool) {

      sinon.spy(lassoTool, 'activateSelection');

      // given
      var e = createKeyEvent(container, 76, false);

      // when
      keyboard._keyHandler(e);

      // then
      expect(lassoTool.activateSelection.calledOnce).to.be.true;
    }));


    it('should trigger space tool', inject(function(keyboard, spaceTool) {

      sinon.spy(spaceTool, 'activateSelection');

      // given
      var e = createKeyEvent(container, 83, false);

      // when
      keyboard._keyHandler(e);

      // then
      expect(spaceTool.activateSelection.calledOnce).to.be.true;
    }));


    it('should trigger hand tool', inject(function(keyboard, handTool) {

      sinon.spy(handTool, 'activateHand');

      // given
      var h = createKeyEvent(container, 72, false);

      // when
      keyboard._keyHandler(h);

      // then
      expect(handTool.activateHand.calledOnce).to.be.true;
    }));

  });

});
