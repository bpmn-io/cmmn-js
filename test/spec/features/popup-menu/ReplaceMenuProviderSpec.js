'use strict';

/* global bootstrapModeler, inject */

var TestHelper = require('../../../TestHelper');

var globalEvent = require('../../../util/MockEvents.js').createEvent;

var coreModule = require('../../../../lib/core'),
    modelingModule = require('../../../../lib/features/modeling'),
    replaceMenuProviderModule = require('../../../../lib/features/popup-menu');

var domQuery = require('min-dom').query,
    domClasses = require('min-dom').classes;

function queryEntry(popupMenu, id) {
  return queryPopup(popupMenu, '[data-id="' + id + '"]');
}

function queryPopup(popupMenu, selector) {
  return domQuery(selector, popupMenu._current.container);
}

/**
 * Gets all menu entries from the current open popup menu
 *
 * @param  {PopupMenu} popupMenu
 *
 * @return {<Array>}
 */
function getEntries(popupMenu) {
  var element = popupMenu._current.element;

  return popupMenu._current.provider.getEntries(element);
}

describe('features/popup-menu - replace menu provider', function() {

  var diagramXMLMarkers = require('./ReplaceMenuProvider.toggle.cmmn'),
      diagramXMLReplaceMenu = require('./ReplaceMenuProvider.replace-menu.cmmn');

  var testModules = [
    coreModule,
    modelingModule,
    replaceMenuProviderModule
  ];

  var openPopup = function(element, offset) {
    offset = offset || 100;

    TestHelper.getCmmnJs().invoke(function(popupMenu) {

      var position = {
        x: element.x + offset,
        y: element.y + offset
      };

      popupMenu.open(
        element,
        'cmmn-replace',
        position
      );
    });
  };


  describe('toggle', function() {

    beforeEach(bootstrapModeler(diagramXMLMarkers, { modules: testModules }));

    var toggleActive;

    beforeEach(inject(function(popupMenu) {
      toggleActive = function(entryCls) {
        return popupMenu._getEntry(entryCls).active;
      };
    }));


    describe('active attribute', function() {

      it('should be true for auto complete', inject(function(popupMenu, cmmnReplace, elementRegistry) {

        // given
        var casePlanModel = elementRegistry.get('CasePlanModel_1');

        // when
        openPopup(casePlanModel);

        // then
        expect(toggleActive('toggle-auto-complete')).to.be.true;
      }));


      it('should be true for isBlocking', inject(function(popupMenu, cmmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('PI_HumanTask_1');

        // when
        openPopup(task);

        // then
        expect(toggleActive('toggle-is-blocking')).to.be.true;
      }));


      it('should be true for required rule', inject(function(popupMenu, cmmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('PI_HumanTask_1');

        // when
        openPopup(task);

        // then
        expect(toggleActive('toggle-required-rule')).to.be.true;
      }));


      it('should be true for manual activation rule', inject(function(popupMenu, cmmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('PI_HumanTask_1');

        // when
        openPopup(task);

        // then
        expect(toggleActive('toggle-manual-activation-rule')).to.be.true;
      }));


      it('should be true for repetition rule', inject(function(popupMenu, cmmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('PI_HumanTask_1');

        // when
        openPopup(task);

        // then
        expect(toggleActive('toggle-repetition-rule')).to.be.true;
      }));

    });


    describe('toggle button', function() {

      it('auto complete off', inject(function(popupMenu, cmmnReplace, elementRegistry) {

        // given
        var casePlanModel = elementRegistry.get('CasePlanModel_1');

        openPopup(casePlanModel);

        var entry = queryEntry(popupMenu, 'toggle-auto-complete');

        // when
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

        openPopup(casePlanModel);

        var autoCompleteEntry = queryEntry(popupMenu, 'toggle-auto-complete');

        // then
        expect(casePlanModel.businessObject.autoComplete).to.be.false;
        expect(domClasses(autoCompleteEntry).has('active')).to.be.false;

      }));


      it('isblocking off', inject(function(popupMenu, cmmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('PI_HumanTask_1');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-is-blocking');

        // when
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

        openPopup(task);

        var nonBlockingEntry = queryEntry(popupMenu, 'toggle-is-blocking');

        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.false;
        expect(domClasses(nonBlockingEntry).has('active')).to.be.false;

      }));


      it('required rule off', inject(function(popupMenu, cmmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('PI_HumanTask_1');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-required-rule');

        // when
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

        openPopup(task);

        var requiredRuleEntry = queryEntry(popupMenu, 'toggle-required-rule');

        // then
        expect(task.businessObject.itemControl.requiredRule).not.to.exist;
        expect(domClasses(requiredRuleEntry).has('active')).to.be.false;

      }));


      it('manual activation rule off', inject(function(popupMenu, cmmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('PI_HumanTask_1');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-manual-activation-rule');

        // when
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

        openPopup(task);

        var manualActivationRuleEntry = queryEntry(popupMenu, 'toggle-manual-activation-rule');

        // then
        expect(task.businessObject.itemControl.manualActivationRule).not.to.exist;
        expect(domClasses(manualActivationRuleEntry).has('active')).to.be.false;

      }));


      it('repetition rule off', inject(function(popupMenu, cmmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('PI_HumanTask_1');

        openPopup(task);

        var entry = queryEntry(popupMenu, 'toggle-repetition-rule');

        // when
        popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

        openPopup(task);

        var repetitionRuleEntry = queryEntry(popupMenu, 'toggle-repetition-rule');

        // then
        expect(task.businessObject.itemControl.repetitionRule).not.to.exist;
        expect(domClasses(repetitionRuleEntry).has('active')).to.be.false;

      }));

    });

  });


  describe('replace menu', function() {

    beforeEach(bootstrapModeler(diagramXMLReplaceMenu, { modules: testModules }));


    describe('event listener', function() {

      it('should contain all except the current one',
        inject(function(popupMenu, elementRegistry) {

          // given
          var eventListener = elementRegistry.get('PI_EventListener_1');

          // when
          openPopup(eventListener);

          // then
          expect(queryEntry(popupMenu, 'replace-with-event-listener-plan-item')).to.be.null;
          expect(getEntries(popupMenu)).to.have.length(2);

        })
      );

    });


    describe('task', function() {

      it('should contain only specific entries (blocking plan item)',
        inject(function(popupMenu, elementRegistry) {

          // given
          var task = elementRegistry.get('PI_Task_1');

          // when
          openPopup(task);

          // then
          // expect the replace menu to contain
          // - all non discretionary task items except the current one
          // - a discretionary item from the same task type
          // - expanded stage
          // - collapsed stage
          expect(queryEntry(popupMenu, 'replace-with-task-plan-item')).to.be.null;
          expect(getEntries(popupMenu)).to.have.length(7);

        })
      );


      it('should contain only specific entries (blocking discretionary item)',
        inject(function(popupMenu, elementRegistry) {

          // given
          var task = elementRegistry.get('DIS_Task_2');

          // when
          openPopup(task);

          // then
          // expect the replace menu to contain
          // - all discretionary task items except the current one
          // - a non discretionary item from the same task type
          // - discretionary expanded stage
          // - discretionary collapsed stage
          expect(queryEntry(popupMenu, 'replace-with-task-discretionary-item')).to.be.null;
          expect(getEntries(popupMenu)).to.have.length(7);

        })
      );


      it('should contain blocking human task',
        inject(function(popupMenu, elementRegistry) {

          // given
          var task = elementRegistry.get('PI_Task_1');

          // when
          openPopup(task);

          // then
          expect(queryEntry(popupMenu, 'replace-with-blocking-human-task-plan-item')).to.exist;

        })
      );


      it('should contain only specific entries (non-blocking plan item)',
        inject(function(popupMenu, elementRegistry) {

          // given
          var task = elementRegistry.get('PI_Task_3');

          // when
          openPopup(task);

          // then
          // expect the replace menu to contain
          // - all non discretionary task items except the current one
          // - a discretionary item from the same task type
          // - expanded stage
          // - collapsed stage
          expect(queryEntry(popupMenu, 'replace-with-task-plan-item')).to.be.null;
          expect(getEntries(popupMenu)).to.have.length(7);

        })
      );


      it('should contain only specific entries (non-blocking discretionary item)',
        inject(function(popupMenu, elementRegistry) {

          // given
          var task = elementRegistry.get('DIS_Task_4');

          // when
          openPopup(task);

          // then
          // expect the replace menu to contain
          // - all discretionary task items except the current one
          // - a non discretionary item from the same task type
          // - discretionary expanded stage
          // - discretionary collapsed stage
          expect(queryEntry(popupMenu, 'replace-with-task-discretionary-item')).to.be.null;
          expect(getEntries(popupMenu)).to.have.length(7);

        })
      );


      it('should contain non-blocking human task',
        inject(function(popupMenu, elementRegistry) {

          // given
          var task = elementRegistry.get('PI_Task_3');

          // when
          openPopup(task);

          // then
          expect(queryEntry(popupMenu, 'replace-with-non-blocking-human-task-plan-item')).to.exist;

        })
      );

    });


    describe('milestone', function() {

      it('should be empty',
        inject(function(popupMenu, elementRegistry) {

          // given
          var eventListener = elementRegistry.get('PI_Milestone_1');

          // when
          openPopup(eventListener);

          // then
          expect(getEntries(popupMenu)).to.be.empty;

        })
      );

    });


    describe('stage (expanded)', function() {

      it('should contain all except the current one',
        inject(function(popupMenu, elementRegistry) {

          // given
          var eventListener = elementRegistry.get('PI_Stage_1');

          // when
          openPopup(eventListener);

          // then
          expect(getEntries(popupMenu)).to.have.length(2);

        })
      );

    });


    describe('stage (collapsed)', function() {

      it('should contain only specific entries',
        inject(function(popupMenu, elementRegistry) {

          // given
          var eventListener = elementRegistry.get('PI_Stage_2');

          // when
          openPopup(eventListener);

          // then
          // expect the replace menu to contain
          // - all non discretionary tasks
          // - expanded stage
          // - discretionary collapsed stage
          // - discretionary expanded stage
          expect(getEntries(popupMenu)).to.have.length(8);

        })
      );

    });


    describe('discretionary stage (collapsed)', function() {

      it('should contain all except the current one',
        inject(function(popupMenu, elementRegistry) {

          // given
          var eventListener = elementRegistry.get('DIS_Stage_3');

          // when
          openPopup(eventListener);

          // then
          // expect the replace menu to contain
          // - all discretionary tasks
          // - expanded stage
          // - collapsed stage
          // - discretionary expanded stage
          expect(getEntries(popupMenu)).to.have.length(8);

        })
      );

    });


    describe('plan fragment (collapsed)', function() {

      it('should contain all except the current one',
        inject(function(popupMenu, elementRegistry) {

          // given
          var eventListener = elementRegistry.get('DIS_PlanFragment_1');

          // when
          openPopup(eventListener);

          // then
          // expect the replace menu to contain
          // - all discretionary tasks
          // - discretionary collapsed stage
          // - discretionary expanded stage
          expect(getEntries(popupMenu)).to.have.length(7);

        })
      );

    });


    describe('entry criterion', function() {

      it('should contain all except the current one',
        inject(function(popupMenu, elementRegistry) {

          // given
          var eventListener = elementRegistry.get('EntryCriterion_1');

          // when
          openPopup(eventListener);

          // then
          expect(queryEntry(popupMenu, 'replace-with-entry-criterion')).not.to.exist;
          expect(getEntries(popupMenu)).to.have.length(1);

        })
      );

    });


    describe('exit criterion', function() {

      it('should contain all except the current one',
        inject(function(popupMenu, elementRegistry) {

          // given
          var eventListener = elementRegistry.get('ExitCriterion_1');

          // when
          openPopup(eventListener);

          // then
          expect(queryEntry(popupMenu, 'replace-with-exit-criterion')).not.to.exist;
          expect(getEntries(popupMenu)).to.have.length(1);

        })
      );

    });

  });

});
