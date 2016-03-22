'use strict';

var Helper = require('./Helper');

var expectCanDrop = Helper.expectCanDrop;

/* global bootstrapModeler */

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling/rules - CmmnRules', function() {

  var testModules = [ coreModule, modelingModule ];

  var testXML = require('./CmmnRules.cmmn');

  beforeEach(bootstrapModeler(testXML, { modules: testModules }));

  describe('task', function() {

    describe('drop', function() {

      it('should not be allowed on root', function() {
        expectCanDrop('PI_Task_1', 'Diagram_1', false);
      });


      it('should be allowed on case plan', function() {
        expectCanDrop('PI_Task_1', 'CasePlan_1', true);
      });


      it('should be allowed on stage', function() {
        expectCanDrop('PI_Task_1', 'PI_Stage_1', true);
      });


      it('should not be allowed on task', function() {
        expectCanDrop('PI_Task_1', 'PI_Task_1', false);
      });


      it('should not be allowed on milestone', function() {
        expectCanDrop('PI_Task_1', 'PI_Milestone_1', false);
      });


      it('should not be allowed on entry criterion', function() {
        expectCanDrop('PI_Task_1', 'Entry_1', false);
      });


      it('should not be allowed on entry criterion', function() {
        expectCanDrop('PI_Task_1', 'Exit_1', false);
      });


      it('should not be allowed on user event listener', function() {
        expectCanDrop('PI_Task_1', 'PI_Listener_1', false);
      });


      it('should not be allowed on a collapsed stage', function() {
        expectCanDrop('PI_Task_1', 'PI_CollapsedStage_1', false);
      });

    });

  });

  describe('stage', function() {

    describe('drop', function() {

      it('should not be allowed on root', function() {
        expectCanDrop('PI_Stage_1', 'Diagram_1', false);
      });


      it('should be allowed on case plan', function() {
        expectCanDrop('PI_Stage_1', 'CasePlan_1', true);
      });


      it('should be allowed on stage', function() {
        expectCanDrop('PI_Stage_1', 'PI_Stage_1', true);
      });


      it('should not be allowed on task', function() {
        expectCanDrop('PI_Stage_1', 'PI_Task_1', false);
      });


      it('should not be allowed on milestone', function() {
        expectCanDrop('PI_Stage_1', 'PI_Milestone_1', false);
      });


      it('should not be allowed on entry criterion', function() {
        expectCanDrop('PI_Stage_1', 'Entry_1', false);
      });


      it('should not be allowed on entry criterion', function() {
        expectCanDrop('PI_Stage_1', 'Exit_1', false);
      });


      it('should not be allowed on user event listener', function() {
        expectCanDrop('PI_Stage_1', 'PI_Listener_1', false);
      });


      it('should not be allowed on a collapsed stage', function() {
        expectCanDrop('PI_Stage_1', 'PI_CollapsedStage_1', false);
      });

    });

  });

});
