'use strict';

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - update controls', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('rules', function() {

    describe('set', function() {

      var diagramXML = require('./UpdateControls.set-rules.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      var task, rule;

      describe('should create itemControl when', function() {

        describe('setting required rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_1');
            rule = cmmnFactory.create('cmmn:RequiredRule');

            // when
            modeling.updateControls(task, { requiredRule: rule });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.$parent).to.equal(task.businessObject);

            expect(task.businessObject.itemControl.requiredRule).to.exist;
            expect(task.businessObject.itemControl.requiredRule).to.equal(rule);
            expect(rule.$parent).to.equal(task.businessObject.itemControl);

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {
            // given
            var itemControl = task.businessObject.itemControl;

            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).not.to.exist;
            expect(itemControl.$parent).not.exist;

            expect(itemControl.requiredRule).not.to.exist;
            expect(rule.$parent).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.$parent).to.equal(task.businessObject);

            expect(task.businessObject.itemControl.requiredRule).to.exist;
            expect(task.businessObject.itemControl.requiredRule).to.equal(rule);

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          }));

        });


        describe('setting manual activation rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_1');
            rule = cmmnFactory.create('cmmn:ManualActivationRule');

            // when
            modeling.updateControls(task, { manualActivationRule: rule });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.$parent).to.equal(task.businessObject);

            expect(task.businessObject.itemControl.manualActivationRule).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).to.equal(rule);
            expect(rule.$parent).to.equal(task.businessObject.itemControl);

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {
            // given
            var itemControl = task.businessObject.itemControl;

            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).not.to.exist;
            expect(itemControl.$parent).not.exist;

            expect(itemControl.manualActivationRule).not.to.exist;
            expect(rule.$parent).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.$parent).to.equal(task.businessObject);

            expect(task.businessObject.itemControl.manualActivationRule).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).to.equal(rule);

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          }));

        });


        describe('setting repetition rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_1');
            rule = cmmnFactory.create('cmmn:RepetitionRule');

            // when
            modeling.updateControls(task, { repetitionRule: rule });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.$parent).to.equal(task.businessObject);

            expect(task.businessObject.itemControl.repetitionRule).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).to.equal(rule);
            expect(rule.$parent).to.equal(task.businessObject.itemControl);

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {
            // given
            var itemControl = task.businessObject.itemControl;

            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).not.to.exist;
            expect(itemControl.$parent).not.exist;

            expect(itemControl.repetitionRule).not.to.exist;
            expect(rule.$parent).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.$parent).to.equal(task.businessObject);

            expect(task.businessObject.itemControl.repetitionRule).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).to.equal(rule);

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          }));

        });

      });


      describe('should keep defaultControl when', function() {

        describe('setting required rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_2');
            rule = cmmnFactory.create('cmmn:RequiredRule');

            // when
            modeling.updateControls(task, { requiredRule: rule });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).not.to.equal(rule);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).not.to.equal(rule);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).not.to.equal(rule);
          }));

        });


        describe('setting manual activation rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_2');
            rule = cmmnFactory.create('cmmn:ManualActivationRule');

            // when
            modeling.updateControls(task, { manualActivationRule: rule });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).not.to.equal(rule);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).not.to.equal(rule);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).not.to.equal(rule);
          }));

        });


        describe('setting repetition rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_2');
            rule = cmmnFactory.create('cmmn:RepetitionRule');

            // when
            modeling.updateControls(task, { repetitionRule: rule });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).not.to.equal(rule);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).not.to.equal(rule);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).not.to.equal(rule);
          }));

        });

      });


      describe('should update itemControl when', function() {

        describe('setting required rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_3');
            rule = cmmnFactory.create('cmmn:RequiredRule');

            // when
            modeling.updateControls(task, { requiredRule: rule });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.requiredRule).to.exist;
            expect(task.businessObject.itemControl.requiredRule).to.equal(rule);

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).not.to.equal(rule);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.requiredRule).to.exist;
            expect(task.businessObject.itemControl.requiredRule).not.to.equal(rule);

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).not.to.equal(rule);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.requiredRule).to.exist;
            expect(task.businessObject.itemControl.requiredRule).to.equal(rule);

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).not.to.equal(rule);
          }));

        });


        describe('setting manual activation rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_3');
            rule = cmmnFactory.create('cmmn:ManualActivationRule');

            // when
            modeling.updateControls(task, { manualActivationRule: rule });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).to.equal(rule);

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).not.to.equal(rule);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).not.to.equal(rule);

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).not.to.equal(rule);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).to.equal(rule);

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).not.to.equal(rule);
          }));

        });


        describe('setting repetition rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_3');
            rule = cmmnFactory.create('cmmn:RepetitionRule');

            // when
            modeling.updateControls(task, { repetitionRule: rule });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).to.equal(rule);

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).not.to.equal(rule);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).not.to.equal(rule);

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).not.to.equal(rule);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).to.equal(rule);

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).not.to.equal(rule);
          }));

        });

      });

    });


    describe('delete', function() {

      var diagramXML = require('./UpdateControls.delete-rules.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      var task;

      describe('should delete from itemControl', function() {

        describe('required rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_1');

            // when
            modeling.updateControls(task, { requiredRule: undefined });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.requiredRule).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.requiredRule).to.exist;

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.requiredRule).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          }));

        });


        describe('manual activation rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_1');

            // when
            modeling.updateControls(task, { manualActivationRule: undefined });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).to.exist;

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          }));

        });


        describe('repetition rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_1');

            // when
            modeling.updateControls(task, { repetitionRule: undefined });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).to.exist;

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
          }));

        });

      });


      describe('should delete from defaultControl', function() {

        describe('required rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_2');

            // when
            modeling.updateControls(task, { requiredRule: undefined });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).not.to.exist;
          }));

        });


        describe('manual activation rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_2');

            // when
            modeling.updateControls(task, { manualActivationRule: undefined });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).not.to.exist;
          }));

        });


        describe('repetition rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_2');

            // when
            modeling.updateControls(task, { repetitionRule: undefined });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).not.to.exist;
          }));

        });

      });


      describe('should delete from defaultControl and itemControl', function() {

        describe('required rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_3');

            // when
            modeling.updateControls(task, { requiredRule: undefined });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.requiredRule).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.requiredRule).to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.requiredRule).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.requiredRule).not.to.exist;
          }));

        });


        describe('manual activation rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_3');

            // when
            modeling.updateControls(task, { manualActivationRule: undefined });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.manualActivationRule).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.manualActivationRule).not.to.exist;
          }));

        });


        describe('repetition rule', function() {

          beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

            // given
            task = elementRegistry.get('PI_Task_3');

            // when
            modeling.updateControls(task, { repetitionRule: undefined });

          }));

          it('should execute', function() {
            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).to.exist;
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(task.businessObject.itemControl).to.exist;
            expect(task.businessObject.itemControl.repetitionRule).not.to.exist;

            expect(task.businessObject.definitionRef.defaultControl).to.exist;
            expect(task.businessObject.definitionRef.defaultControl.repetitionRule).not.to.exist;
          }));

        });

      });


      describe('should delete itemControl', function() {

        beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

          // given
          task = elementRegistry.get('PI_Task_1');

          // when
          modeling.updateControls(task, {
            requiredRule: undefined,
            manualActivationRule: undefined,
            repetitionRule: undefined
          });

        }));

        it('should execute', function() {
          // then
          expect(task.businessObject.itemControl).not.to.exist;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(task.businessObject.itemControl).to.exist;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(task.businessObject.itemControl).not.to.exist;
        }));

      });


      describe('should delete defaultControl', function() {

        beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

          // given
          task = elementRegistry.get('PI_Task_2');

          // when
          modeling.updateControls(task, {
            requiredRule: undefined,
            manualActivationRule: undefined,
            repetitionRule: undefined
          });

        }));

        it('should execute', function() {
          // then
          expect(task.businessObject.itemControl).not.to.exist;
          expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(task.businessObject.itemControl).not.to.exist;
          expect(task.businessObject.definitionRef.defaultControl).to.exist;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(task.businessObject.itemControl).not.to.exist;
          expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
        }));

      });


      describe('should delete defaultControl and itemControl', function() {

        beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

          // given
          task = elementRegistry.get('PI_Task_3');

          // when
          modeling.updateControls(task, {
            requiredRule: undefined,
            manualActivationRule: undefined,
            repetitionRule: undefined
          });

        }));

        it('should execute', function() {
          // then
          expect(task.businessObject.itemControl).not.to.exist;
          expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(task.businessObject.itemControl).to.exist;
          expect(task.businessObject.definitionRef.defaultControl).to.exist;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(task.businessObject.itemControl).not.to.exist;
          expect(task.businessObject.definitionRef.defaultControl).not.to.exist;
        }));

      });

      describe('should duplicate shared plan item definition when updating defaultControl', function() {

        var task2, casePlanModel;

        beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

          // given
          task = elementRegistry.get('PI_Task_4_1');
          task2 = elementRegistry.get('PI_Task_4_2');
          casePlanModel = elementRegistry.get('CasePlanModel_1');

          // when
          modeling.updateControls(task, {
            requiredRule: undefined,
            manualActivationRule: undefined,
            repetitionRule: undefined
          });

        }));

        it('should execute', function() {
          // then
          expect(task.businessObject.definitionRef).not.to.equal(task2.businessObject.definitionRef);
          expect(task.businessObject.definitionRef.$parent).to.equal(task2.businessObject.definitionRef.$parent);
          expect(casePlanModel.businessObject.planItemDefinitions).to.include(task.businessObject.definitionRef);
        });


        it('should undo', inject(function(commandStack) {
          // given
          var definition = task.businessObject.definitionRef;
          // when
          commandStack.undo();

          // then
          expect(task.businessObject.definitionRef).to.equal(task2.businessObject.definitionRef);
          expect(definition.$parent).not.to.exist;
          expect(casePlanModel.businessObject.planItemDefinitions).not.to.include(definition);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(task.businessObject.definitionRef).not.to.equal(task2.businessObject.definitionRef);
          expect(task.businessObject.definitionRef.$parent).to.equal(task2.businessObject.definitionRef.$parent);
          expect(casePlanModel.businessObject.planItemDefinitions).to.include(task.businessObject.definitionRef);
        }));


      });


      describe('should not duplicate shared plan item definition when updating defaultControl', function() {

        var task2;

        beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

          // given
          task = elementRegistry.get('PI_Task_5_1');
          task2 = elementRegistry.get('PI_Task_5_2');

          // when
          modeling.updateControls(task, {
            requiredRule: undefined,
            manualActivationRule: undefined,
            repetitionRule: undefined
          });

        }));

        it('should execute', function() {
          // then
          expect(task.businessObject.definitionRef).to.equal(task2.businessObject.definitionRef);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(task.businessObject.definitionRef).to.equal(task2.businessObject.definitionRef);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(task.businessObject.definitionRef).to.equal(task2.businessObject.definitionRef);
        }));

      });


      describe('should not duplicate shared human task with discretionary items when updating defaultControl', function() {

        var task2;

        beforeEach(inject(function(elementRegistry, modeling, cmmnFactory) {

          // given
          task = elementRegistry.get('PI_HumanTask_1_1');
          task2 = elementRegistry.get('PI_HumanTask_1_2');

          // when
          modeling.updateControls(task, {
            requiredRule: undefined,
            manualActivationRule: undefined,
            repetitionRule: undefined
          });

        }));

        it('should execute', function() {
          // then
          expect(task.businessObject.definitionRef).to.equal(task2.businessObject.definitionRef);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(task.businessObject.definitionRef).to.equal(task2.businessObject.definitionRef);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(task.businessObject.definitionRef).to.equal(task2.businessObject.definitionRef);
        }));

      });

    });

  });

  describe('isBlocking', function() {

    var diagramXML = require('./UpdateControls.blocking.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var task;

    describe('set non-blocking', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        task = elementRegistry.get('PI_HumanTask_1');

        // when
        modeling.updateControls(task, { isBlocking: false });

      }));

      it('should execute', function() {
        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.false;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.true;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.false;
      }));

    });


    describe('set blocking', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        task = elementRegistry.get('PI_HumanTask_4');

        // when
        modeling.updateControls(task, { isBlocking: true });

      }));

      it('should execute', function() {
        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.true;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.false;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.true;
      }));

    });

    describe('should duplicate plan item definition when changing isBlocking', function() {

      var task2, casePlanModel;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        task = elementRegistry.get('PI_HumanTask_2_1');
        task2 = elementRegistry.get('PI_HumanTask_2_2');
        casePlanModel = elementRegistry.get('CasePlanModel_1');

        // when
        modeling.updateControls(task, { isBlocking: false });

      }));

      it('should execute', function() {
        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.false;
        expect(task2.businessObject.definitionRef.isBlocking).to.be.true;

        expect(task.businessObject.definitionRef).not.to.equal(task2.businessObject.definitionRef);
        expect(task.businessObject.definitionRef.$parent).to.equal(task2.businessObject.definitionRef.$parent);
        expect(casePlanModel.businessObject.planItemDefinitions).to.include(task.businessObject.definitionRef);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.true;
        expect(task2.businessObject.definitionRef.isBlocking).to.be.true;

        expect(task.businessObject.definitionRef).to.equal(task2.businessObject.definitionRef);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.false;
        expect(task2.businessObject.definitionRef.isBlocking).to.be.true;

        expect(task.businessObject.definitionRef).not.to.equal(task2.businessObject.definitionRef);
        expect(task.businessObject.definitionRef.$parent).to.equal(task2.businessObject.definitionRef.$parent);
        expect(casePlanModel.businessObject.planItemDefinitions).to.include(task.businessObject.definitionRef);
      }));

    });


    describe('should not duplicate plan item definition when changing isBlocking', function() {

      var task2;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        task = elementRegistry.get('PI_HumanTask_3_1');
        task2 = elementRegistry.get('PI_HumanTask_3_2');

        // when
        modeling.updateControls(task, { isBlocking: false });

      }));

      it('should execute', function() {
        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.false;
        expect(task2.businessObject.definitionRef.isBlocking).to.be.false;

        expect(task.businessObject.definitionRef).to.equal(task2.businessObject.definitionRef);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.true;
        expect(task2.businessObject.definitionRef.isBlocking).to.be.true;

        expect(task.businessObject.definitionRef).to.equal(task2.businessObject.definitionRef);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(task.businessObject.definitionRef.isBlocking).to.be.false;
        expect(task2.businessObject.definitionRef.isBlocking).to.be.false;

        expect(task.businessObject.definitionRef).to.equal(task2.businessObject.definitionRef);
      }));

    });

  });


  describe('autoComplete', function() {

    var diagramXML = require('./UpdateControls.autoComplete.cmmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var stage;

    describe('set autoComplete to true', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        stage = elementRegistry.get('PI_Stage_1');

        // when
        modeling.updateControls(stage, { autoComplete: true });

      }));

      it('should execute', function() {
        // then
        expect(stage.businessObject.definitionRef.autoComplete).to.be.true;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(stage.businessObject.definitionRef.autoComplete).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(stage.businessObject.definitionRef.autoComplete).to.be.true;
      }));

    });


    describe('set autoComplete to false', function() {

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        stage = elementRegistry.get('PI_Stage_2');

        // when
        modeling.updateControls(stage, { autoComplete: false });

      }));

      it('should execute', function() {
        // then
        expect(stage.businessObject.definitionRef.autoComplete).to.be.false;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(stage.businessObject.definitionRef.autoComplete).to.be.true;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(stage.businessObject.definitionRef.autoComplete).to.be.false;
      }));

    });

    describe('should duplicate plan item definition when changing autoComplete', function() {

      var stage2, casePlanModel;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        stage = elementRegistry.get('PI_Stage_3_1');
        stage2 = elementRegistry.get('PI_Stage_3_2');
        casePlanModel = elementRegistry.get('CasePlanModel_1');

        // when
        modeling.updateControls(stage, { autoComplete: true });

      }));

      it('should execute', function() {
        // then
        expect(stage.businessObject.definitionRef.autoComplete).to.be.true;
        expect(stage2.businessObject.definitionRef.autoComplete).not.to.exist;

        expect(stage.businessObject.definitionRef).not.to.equal(stage2.businessObject.definitionRef);
        expect(stage.businessObject.definitionRef.$parent).to.equal(stage2.businessObject.definitionRef.$parent);
        expect(casePlanModel.businessObject.planItemDefinitions).to.include(stage.businessObject.definitionRef);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(stage.businessObject.definitionRef.autoComplete).not.to.exist;
        expect(stage2.businessObject.definitionRef.autoComplete).not.to.exist;

        expect(stage.businessObject.definitionRef).to.equal(stage2.businessObject.definitionRef);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(stage.businessObject.definitionRef.autoComplete).to.be.true;
        expect(stage2.businessObject.definitionRef.autoComplete).not.to.exist;

        expect(stage.businessObject.definitionRef).not.to.equal(stage2.businessObject.definitionRef);
        expect(stage.businessObject.definitionRef.$parent).to.equal(stage2.businessObject.definitionRef.$parent);
        expect(casePlanModel.businessObject.planItemDefinitions).to.include(stage.businessObject.definitionRef);
      }));

    });


    describe('should not duplicate plan item definition when changing isBlocking', function() {

      var stage2;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        stage = elementRegistry.get('PI_Stage_4_1');
        stage2 = elementRegistry.get('PI_Stage_4_2');

        // when
        modeling.updateControls(stage, { autoComplete: true });

      }));

      it('should execute', function() {
        // then
        expect(stage.businessObject.definitionRef.autoComplete).to.be.true;
        expect(stage2.businessObject.definitionRef.autoComplete).to.be.true;

        expect(stage.businessObject.definitionRef).to.equal(stage2.businessObject.definitionRef);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(stage.businessObject.definitionRef.autoComplete).not.to.exist;
        expect(stage2.businessObject.definitionRef.autoComplete).not.to.exist;

        expect(stage.businessObject.definitionRef).to.equal(stage2.businessObject.definitionRef);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(stage.businessObject.definitionRef.autoComplete).to.be.true;
        expect(stage2.businessObject.definitionRef.autoComplete).to.be.true;

        expect(stage.businessObject.definitionRef).to.equal(stage2.businessObject.definitionRef);
      }));

    });

  });

});
