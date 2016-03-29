'use strict';

var Helper = require('./Helper');

var expectCanDrop = Helper.expectCanDrop;
var expectCanResize = Helper.expectCanResize;

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


      describe('discretionary item', function() {

        it('should be allowed on a discretionary stage', function() {
          expectCanDrop('PI_Task_1', 'DIS_Stage_2', true);
        });


        it('should not be allowed on discretionary task', function() {
          expectCanDrop('PI_Task_1', 'DIS_Task_2', false);
        });


        it('should not be allowed on discretionary milestone', function() {
          expectCanDrop('PI_Task_1', 'DIS_Milestone_1', false);
        });


        it('should not be allowed on user discretionary event listener', function() {
          expectCanDrop('PI_Task_1', 'DIS_Listener_1', false);
        });


        it('should not be allowed on a discretionary collapsed stage', function() {
          expectCanDrop('PI_Task_1', 'DIS_Collapsed_Stage_1', false);
        });

      });

    });

    describe('resize', function() {

      it('should not be allowed', function() {
        expectCanResize('PI_Task_1', null, false);
      });

      describe('discretionary item', function() {

        it('should not be allowed', function() {
          expectCanResize('DIS_Task_2', null, false);
        });

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


      describe('discretionary item', function() {

        it('should be allowed on a discretionary stage', function() {
          expectCanDrop('PI_Stage_1', 'DIS_Stage_2', true);
        });


        it('should not be allowed on discretionary task', function() {
          expectCanDrop('PI_Stage_1', 'DIS_Task_2', false);
        });


        it('should not be allowed on discretionary milestone', function() {
          expectCanDrop('PI_Stage_1', 'DIS_Milestone_1', false);
        });


        it('should not be allowed on user discretionary event listener', function() {
          expectCanDrop('PI_Stage_1', 'DIS_Listener_1', false);
        });


        it('should not be allowed on a discretionary collapsed stage', function() {
          expectCanDrop('PI_Stage_1', 'DIS_Collapsed_Stage_1', false);
        });

      });

    });

    describe('resize', function() {

      it('should be allowed', function() {
        expectCanResize('PI_Stage_1', null, true);
      });

      it('should not be allowed to resize with to small width', function() {
        expectCanResize('PI_Stage_1', { width: 99, height: 100 }, false);
      });


      it('should not be allowed to resize with to small width', function() {
        expectCanResize('PI_Stage_1', { width: 100, height: 79 }, false);
      });


      it('should not be allowed to resize a collapsed stage', function() {
        expectCanResize('PI_CollapsedStage_1', null, false);
      });

      describe('discretionary item', function() {

        it('should be allowed', function() {
          expectCanResize('DIS_Stage_2', null, true);
        });


        it('should not be allowed to resize a collapsed stage', function() {
          expectCanResize('DIS_Collapsed_Stage_1', null, false);
        });

      });

      describe('case plan model', function() {

        it('should be allowed', function() {
          expectCanResize('CasePlan_1', null, true);
        });


        it('should not be allowed to resize with to small width', function() {
          expectCanResize('CasePlan_1', { width: 99, height: 100 }, false);
        });


        it('should not be allowed to resize with to small width', function() {
          expectCanResize('CasePlan_1', { width: 100, height: 79 }, false);
        });

      });

    });

  });

  describe('milestone', function() {

    describe('resize', function() {

      it('should not be allowed', function() {
        expectCanResize('PI_Milestone_1', null, false);
      });

      describe('discretionary item', function() {

        it('should not be allowed', function() {
          expectCanResize('DIS_Milestone_1', null, false);
        });

      });

    });

  });

  describe('event listener', function() {

    describe('resize', function() {

      it('should not be allowed', function() {
        expectCanResize('PI_Listener_1', null, false);
      });

      describe('discretionary item', function() {

        it('should not be allowed', function() {
          expectCanResize('DIS_Listener_1', null, false);
        });

      });

    });

  });

  describe('criterion', function() {

    describe('resize', function() {

      it('should not be allowed to resize an entry criterion', function() {
        expectCanResize('Entry_1', null, false);
      });


      it('should not be allowed to resize an exit criterion', function() {
        expectCanResize('Exit_1', null, false);
      });

    });

  });

  describe('case plan', function() {

    describe('drop', function() {

      it('should be allowed on root', function() {
        expectCanDrop('CasePlan_1', 'Diagram_1', true);
      });


      it('should not be allowed on case plan', function() {
        expectCanDrop('CasePlan_1', 'CasePlan_1', false);
      });


      it('should not be allowed on stage', function() {
        expectCanDrop('CasePlan_1', 'PI_Stage_1', false);
      });


      it('should not be allowed on task', function() {
        expectCanDrop('CasePlan_1', 'PI_Task_1', false);
      });


      it('should not be allowed on milestone', function() {
        expectCanDrop('CasePlan_1', 'PI_Milestone_1', false);
      });


      it('should not be allowed on entry criterion', function() {
        expectCanDrop('CasePlan_1', 'Entry_1', false);
      });


      it('should not be allowed on entry criterion', function() {
        expectCanDrop('CasePlan_1', 'Exit_1', false);
      });


      it('should not be allowed on user event listener', function() {
        expectCanDrop('CasePlan_1', 'PI_Listener_1', false);
      });

    });

  });
});
