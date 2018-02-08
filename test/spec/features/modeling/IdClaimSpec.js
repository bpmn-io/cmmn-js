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

    it('should unclaim id when removing plan item', inject(
      function(modeling, moddle) {
        // when
        modeling.removeElements([ element ]);

        // then
        expect(moddle.ids.assigned(id)).to.be.false;
      }
    ));


    it('should revert unclaim action on restoring plan item', inject(
      function(modeling, moddle, commandStack) {
        // given
        modeling.removeElements([ element ]);

        // when
        commandStack.undo();

        // then
        expect(moddle.ids.assigned(id)).to.eql(moddleElement);
      }
    ));


    it('should unclaim id when removing case plan model', inject(
      function(elementRegistry, modeling, moddle) {
        // given
        var casePlanModel = elementRegistry.get('CasePlanModel_1');

        // when
        modeling.removeElements([ casePlanModel ]);

        // then
        expect(moddle.ids.assigned('CasePlanModel_1')).to.be.false;
      }
    ));


    it('should revert unclaim action on restoring case plan model', inject(
      function(elementRegistry, modeling, moddle, commandStack) {

        // given
        var casePlanModel = elementRegistry.get('CasePlanModel_1');

        modeling.removeElements([ casePlanModel ]);

        // when
        commandStack.undo();

        // then
        expect(
          moddle.ids.assigned('CasePlanModel_1')
        ).to.eql(casePlanModel.businessObject);
      }
    ));

  });


  describe('on replace plan item', function() {

    it('should retain id - execute', inject(function(moddle, cmmnReplace) {

      // when
      var processTaskPI = cmmnReplace.replaceElement(element, {
        type: 'cmmn:PlanItem',
        definitionType: 'cmmn:ProcessTask'
      });

      // then
      // expect the new process task plan item to
      // get the id of the replaced human task
      expect(moddle.ids.assigned(id)).to.eql(processTaskPI.businessObject);

    }));


    it('should retain id - undo', inject(
      function(moddle, cmmnReplace, commandStack) {

        // given
        cmmnReplace.replaceElement(element, {
          type: 'cmmn:PlanItem',
          definitionType: 'cmmn:ProcessTask'
        });

        // when
        commandStack.undo();

        // then
        expect(moddle.ids.assigned(id)).to.eql(moddleElement);

      }
    ));

  });

});
