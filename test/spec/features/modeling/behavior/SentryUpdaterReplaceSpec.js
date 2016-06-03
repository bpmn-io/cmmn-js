'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - #SentryUpdater', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('replace', function() {

    describe('should retain sentry', function() {

      var diagramXML = require('./SentryUpdaterReplace.cmmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      var oldElement, newElement, sentry;

      beforeEach(inject(function(elementRegistry, modeling, cmmnReplace) {

        // given
        oldElement = elementRegistry.get('PI_Stage_1');

        sentry = elementRegistry.get('EntryCriterion_1').businessObject.sentryRef;

        var newElementData = {
          type: 'cmmn:DiscretionaryItem',
          definitionType: 'cmmn:PlanFragment'
        };

        // when
        newElement = cmmnReplace.replaceElement(oldElement, newElementData);

      }));


      it('should execute', function() {
        // then
        expect(newElement.businessObject.definitionRef.get('sentries')).to.include(sentry);
        expect(oldElement.businessObject.definitionRef.get('sentries')).not.to.include(sentry);

        expect(sentry.$parent).to.equal(newElement.businessObject.definitionRef);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(newElement.businessObject.definitionRef.get('sentries')).not.to.include(sentry);
        expect(oldElement.businessObject.definitionRef.get('sentries')).to.include(sentry);

        expect(sentry.$parent).to.equal(oldElement.businessObject.definitionRef);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(newElement.businessObject.definitionRef.get('sentries')).to.include(sentry);
        expect(oldElement.businessObject.definitionRef.get('sentries')).not.to.include(sentry);

        expect(sentry.$parent).to.equal(newElement.businessObject.definitionRef);
      }));

    });

  });

});
