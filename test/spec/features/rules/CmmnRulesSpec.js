'use strict';

var Helper = require('./Helper');

var expectCanDrop = Helper.expectCanDrop;
var expectCanResize = Helper.expectCanResize;
var expectCanConnect = Helper.expectCanConnect;
var expectCanMove = Helper.expectCanMove;
var expectCanReplace = Helper.expectCanReplace;

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling/rules - CmmnRules', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('shape', function() {

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

    describe('text annotation', function() {

      describe('drop', function() {

        it('should be allowed on root', function() {
          expectCanDrop('TextAnnotation_1', 'Diagram_1', true);
        });


        it('should be allowed on case plan', function() {
          expectCanDrop('TextAnnotation_1', 'CasePlan_1', true);
        });


        it('should be allowed on stage', function() {
          expectCanDrop('TextAnnotation_1', 'PI_Stage_1', true);
        });


        it('should not be allowed on task', function() {
          expectCanDrop('TextAnnotation_1', 'PI_Task_1', false);
        });


        it('should not be allowed on milestone', function() {
          expectCanDrop('TextAnnotation_1', 'PI_Milestone_1', false);
        });


        it('should not be allowed on entry criterion', function() {
          expectCanDrop('TextAnnotation_1', 'Entry_1', false);
        });


        it('should not be allowed on entry criterion', function() {
          expectCanDrop('TextAnnotation_1', 'Exit_1', false);
        });


        it('should not be allowed on user event listener', function() {
          expectCanDrop('TextAnnotation_1', 'PI_Listener_1', false);
        });

      });

      describe('resize', function() {

        it('should be allowed to resize', function() {
          expectCanResize('TextAnnotation_1', null, true);
        });

      });

    });

  });


  describe('connection', function() {

    var testXML = require('./CmmnRules.connection.cmmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));

    it('connect Task -> Discretionary Item', function() {

      expectCanConnect('PI_Task_1', 'DIS_Task_2', {
        discretionaryConnection: false
      });

    });


    it('connect HumanTask -> Discretionary Item', function() {

      expectCanConnect('PI_HumanTask_1', 'DIS_Task_2', {
        discretionaryConnection: true
      });

    });


    it('connect EventListener -> Discretionary Item', function() {

      expectCanConnect('PI_Task_1', 'DIS_Task_2', {
        discretionaryConnection: false
      });

    });


    it('connect Milestone -> Discretionary Item', function() {

      expectCanConnect('PI_Milestone_1', 'DIS_Task_2', {
        discretionaryConnection: false
      });

    });


    it('connect Stage -> Discretionary Item', function() {

      expectCanConnect('PI_Stage_1', 'DIS_Task_2', {
        discretionaryConnection: false
      });

    });


    it('connect HumanTask -> Plan Item', function() {

      expectCanConnect('PI_HumanTask_1', 'PI_Task_1', {
        discretionaryConnection: false
      });

    });


    it('connect HumanTask -> Discretionary Item (same definition)', function() {

      expectCanConnect('PI_HumanTask_1', 'DIS_HumanTask_3', {
        discretionaryConnection: false
      });

    });


    it('connect HumanTask -> Discretionary Item (different parents)', function() {

      expectCanConnect('PI_HumanTask_2', 'DIS_Task_2', {
        discretionaryConnection: false
      });

    });


    it('connect HumanTask -> Discretionary Item (already connected)', function() {

      expectCanConnect('PI_HumanTask_3', 'DIS_Task_3', {
        discretionaryConnection: false
      });

    });


    it('connect HumanTask -> Discretionary Item (is discretionary to another human task)', function() {

      expectCanConnect('PI_HumanTask_1', 'DIS_Task_3', {
        discretionaryConnection: false
      });

    });


    it('connect EntryCriterion -> Discretionary Item', function() {

      expectCanConnect('EntryCriterion_1', 'DIS_Task_2', {
        discretionaryConnection: false
      });

    });


    it('connect ExitCriterion -> Discretionary Item', function() {

      expectCanConnect('ExitCriterion_1', 'DIS_Task_2', {
        discretionaryConnection: false
      });

    });


    it('connect CaseFileItem -> Discretionary Item', function() {

      expectCanConnect('IT_File_1', 'DIS_Task_2', {
        discretionaryConnection: false
      });

    });

    it('connect Task -> Text Annotation', function() {

      expectCanConnect('PI_HumanTask_1', 'TextAnnotation_1', {
        association: true
      });

    });


    it('connect Milestone -> Text Annotation', function() {

      expectCanConnect('PI_Milestone_1', 'TextAnnotation_1', {
        association: true
      });

    });


    it('connect EventListener -> Text Annotation', function() {

      expectCanConnect('PI_EventListener_1', 'TextAnnotation_1', {
        association: true
      });

    });


    it('connect Criterion -> Text Annotation', function() {

      expectCanConnect('EntryCriterion_1', 'TextAnnotation_1', {
        association: true
      });

    });


    it('connect CaseFileItem -> Text Annotation', function() {

      expectCanConnect('EntryCriterion_1', 'TextAnnotation_1', {
        association: true
      });

    });


    it('connect Stage -> Text Annotation', function() {

      expectCanConnect('PI_Stage_1', 'TextAnnotation_1', {
        association: true
      });

    });

  });

  describe('criterion', function() {

    var testXML = require('./CmmnRules.criterion.cmmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));

    describe('move', function() {

      it('attach/move Entry Criterion -> Case Plan Model', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('EntryCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanMove(elements, 'CasePlanModel_1', {
          attach: 'attach'
        });

      }));


      it('attach/move Exit Criterion -> Case Plan Model', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('ExitCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanMove(elements, 'CasePlanModel_1', {
          attach: 'attach',
          move: false
        });

      }));


      it('attach/move Entry Criterion -> Stage', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('EntryCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanMove(elements, 'PI_Stage_1', {
          attach: 'attach',
          move: false
        });

      }));


      it('attach/move Exit Criterion -> Stage', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('ExitCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanMove(elements, 'PI_Stage_1', {
          attach: 'attach',
          move: false
        });

      }));


      it('attach/move Entry Criterion -> Task', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('EntryCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanMove(elements, 'PI_Task_1', {
          attach: 'attach',
          move: false
        });

      }));


      it('attach/move Exit Criterion -> Task', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('ExitCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanMove(elements, 'PI_Task_1', {
          attach: 'attach',
          move: false
        });

      }));


      it('attach/move Entry Criterion -> EventListener', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('EntryCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanMove(elements, 'PI_EventListener_1', {
          attach: false,
          move: false
        });

      }));


      it('attach/move Exit Criterion -> EventListener', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('ExitCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanMove(elements, 'PI_EventListener_1', {
          attach: false,
          move: false
        });

      }));


      it('attach/move Entry Criterion -> Milestone', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('EntryCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanMove(elements, 'PI_Milestone_1', {
          attach: 'attach',
          move: false
        });

      }));


      it('attach/move Exit Criterion -> Milestone', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('ExitCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanMove(elements, 'PI_Milestone_1', {
          attach: 'attach',
          move: false
        });

      }));


      it('attach/move Entry Criterion -> PlanFragment', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('EntryCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanMove(elements, 'DIS_PlanFragment_1', {
          attach: false,
          move: false
        });

      }));


      it('attach/move Exit Criterion -> PlanFragment', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('ExitCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanMove(elements, 'DIS_PlanFragment_1', {
          attach: false,
          move: false
        });

      }));

    });

    describe('replace', function() {

      it('attach ExitCriterion -> CasePlanModel', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('ExitCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanReplace(elements, 'CasePlanModel_1', false);

      }));


      it('attach EntryCriterion -> CasePlanModel', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('EntryCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanReplace(elements, 'CasePlanModel_1', {
          oldElementId: criterion.id,
          newElementType: 'cmmn:ExitCriterion'
        });

      }));

      it('attach Entry Criterion -> Stage', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('EntryCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanReplace(elements, 'PI_Stage_1', false);

      }));


      it('attach Exit Criterion -> Stage', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('ExitCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanReplace(elements, 'PI_Stage_1', false);

      }));


      it('attach Entry Criterion -> Task', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('EntryCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanReplace(elements, 'PI_Task_1', false);

      }));


      it('attach Exit Criterion -> Task', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('ExitCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanReplace(elements, 'PI_Task_1', false);

      }));


      it('attach Entry Criterion -> EventListener', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('EntryCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanReplace(elements, 'PI_EventListener_1', false);

      }));


      it('attach Exit Criterion -> EventListener', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('ExitCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanReplace(elements, 'PI_EventListener_1', false);

      }));


      it('attach Entry Criterion -> Milestone', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('EntryCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanReplace(elements, 'PI_Milestone_1', false);

      }));


      it('attach Exit Criterion -> Milestone', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('ExitCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanReplace(elements, 'PI_Milestone_1', {
          oldElementId: criterion.id,
          newElementType: 'cmmn:EntryCriterion'
        });

      }));


      it('attach Entry Criterion -> PlanFragment', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('EntryCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanReplace(elements, 'DIS_PlanFragment_1', false);

      }));


      it('attach Exit Criterion -> PlanFragment', inject(function(elementRegistry) {

        // when
        var criterion = elementRegistry.get('ExitCriterion_1');

        var elements = [ criterion ];

        // then
        expectCanReplace(elements, 'DIS_PlanFragment_1', false);

      }));

    });

  });

});
