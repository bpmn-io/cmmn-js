'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - id claim management', function() {

  var testModules = [ coreModule, modelingModule ];

  var diagramXML = require('../../../fixtures/cmmn/simple.cmmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  var id,
      element,
      moddleElement;

  beforeEach(inject(function(elementRegistry, moddle) {
    id = 'PI_Task_1';
    element = elementRegistry.get(id);
    moddleElement = element.businessObject;
  }));


  describe('unclaim', function() {

    it('should unclaim id when removing plan item', inject(function(modeling, moddle) {
      // when
      modeling.removeElements([ element ]);

      // then
      expect(moddle.ids.assigned(id)).to.be.false;
    }));


    it('should revert unclaim action on restoring plan item', inject(function(modeling, moddle, commandStack) {
      // given
      modeling.removeElements([ element ]);

      // when
      commandStack.undo();

      // then
      expect(moddle.ids.assigned(id)).to.eql(moddleElement);
    }));

  });

});
