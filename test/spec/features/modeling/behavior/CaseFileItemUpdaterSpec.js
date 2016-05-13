'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/behavior - CaseFileItemUpdater', function() {

  var testModules = [ modelingModule, coreModule ];

  describe('create', function() {

    var testXML = require('./CaseFileItemUpdater.simple.cmmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));

    var caseFileItem, casePlanModel, caseFileModel;

    beforeEach(inject(function(elementFactory) {
      caseFileItem = elementFactory.createCaseFileItemShape();
    }));

    describe('should add to existing case file model', function() {

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        casePlanModel = elementRegistry.get('CasePlanModel_1');

        // assume
        expect(casePlanModel.businessObject.$parent.caseFileModel).to.exist;
        caseFileModel = casePlanModel.businessObject.$parent.caseFileModel;

        // when
        modeling.createShape(caseFileItem, { x: 350, y: 75 }, casePlanModel);
      }));


      it('should execute', function() {
        // then
        expect(caseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
        expect(caseFileItem.businessObject.$parent).to.equal(caseFileModel);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(caseFileModel.get('caseFileItems')).not.to.include(caseFileItem.businessObject);
        expect(caseFileItem.businessObject.$parent).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(caseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
        expect(caseFileItem.businessObject.$parent).to.equal(caseFileModel);
      }));

    });


    describe('should add to new case file model', function() {

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        casePlanModel = elementRegistry.get('CasePlanModel_2');

        // assume
        expect(casePlanModel.businessObject.$parent.caseFileModel).not.to.exist;

        // when
        modeling.createShape(caseFileItem, { x: 700, y: 200 }, casePlanModel);

        // assume
        expect(casePlanModel.businessObject.$parent.caseFileModel).to.exist;
        caseFileModel = casePlanModel.businessObject.$parent.caseFileModel;

      }));


      it('should execute', function() {
        // then
        expect(caseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
        expect(caseFileItem.businessObject.$parent).to.equal(caseFileModel);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(caseFileModel.get('caseFileItems')).not.to.include(caseFileItem.businessObject);
        expect(casePlanModel.businessObject.$parent.caseFileModel).not.to.exist;
        expect(caseFileItem.businessObject.$parent).not.to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(caseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
        expect(caseFileItem.businessObject.$parent).to.equal(caseFileModel);
      }));

    });

  });


  describe('move', function() {

    var caseFileItem, casePlanModel, caseFileModel;

    describe('simple case file items', function() {

      var testXML = require('./CaseFileItemUpdater.simple.cmmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));

      describe('should retain in case file model', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          caseFileItem = elementRegistry.get('CaseFileItem_1');
          casePlanModel = elementRegistry.get('CasePlanModel_1');

          var target = elementRegistry.get('PI_Stage_1');

          // assume
          expect(casePlanModel.businessObject.$parent.caseFileModel).to.exist;
          caseFileModel = casePlanModel.businessObject.$parent.caseFileModel;

          // when
          modeling.moveElements([ caseFileItem ], { x: 0, y: 150 }, target);
        }));


        it('should execute', function() {
          // then
          expect(caseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(caseFileItem.businessObject.$parent).to.equal(caseFileModel);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(caseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(caseFileItem.businessObject.$parent).to.equal(caseFileModel);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(caseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(caseFileItem.businessObject.$parent).to.equal(caseFileModel);
        }));

      });


      describe('should add to new case file model', function() {

        var oldCaseFileModel;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          caseFileItem = elementRegistry.get('CaseFileItem_1');
          casePlanModel = elementRegistry.get('CasePlanModel_2');
          oldCaseFileModel = elementRegistry.get('CasePlanModel_1').businessObject.$parent.caseFileModel;

          // assume
          expect(casePlanModel.businessObject.$parent.caseFileModel).not.to.exist;

          // when
          modeling.moveElements([ caseFileItem ], { x: 350, y: 50 }, casePlanModel);

          // assume
          expect(casePlanModel.businessObject.$parent.caseFileModel).to.exist;
          caseFileModel = casePlanModel.businessObject.$parent.caseFileModel;

        }));


        it('should execute', function() {
          // then
          expect(caseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(caseFileItem.businessObject.$parent).to.equal(caseFileModel);

          expect(oldCaseFileModel.get('caseFileItems')).to.be.empty;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(caseFileModel.get('caseFileItems')).not.to.include(caseFileItem.businessObject);
          expect(casePlanModel.businessObject.$parent.caseFileModel).not.to.exist;

          expect(oldCaseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(caseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(caseFileItem.businessObject.$parent).to.equal(caseFileModel);

          expect(oldCaseFileModel.get('caseFileItems')).to.be.empty;
        }));

      });

    });


    describe('case file items children', function() {

      var testXML = require('./CaseFileItemUpdater.children.cmmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));

      describe('should retain in "children" container', function() {

        var parent;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          caseFileItem = elementRegistry.get('CaseFileItem_2');
          casePlanModel = elementRegistry.get('CasePlanModel_1');

          parent = caseFileItem.businessObject.$parent;

          var target = elementRegistry.get('PI_Stage_1');

          // assume
          expect(casePlanModel.businessObject.$parent.caseFileModel).to.exist;
          caseFileModel = casePlanModel.businessObject.$parent.caseFileModel;

          // when
          modeling.moveElements([ caseFileItem ], { x: 0, y: 100 }, target);
        }));


        it('should execute', function() {
          // then
          expect(parent.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(caseFileItem.businessObject.$parent).to.equal(parent);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(parent.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(caseFileItem.businessObject.$parent).to.equal(parent);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parent.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(caseFileItem.businessObject.$parent).to.equal(parent);
        }));

      });


      describe('should removed from "children" container', function() {

        var parent, caseFileItem1;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          caseFileItem = elementRegistry.get('CaseFileItem_2');
          caseFileItem1 = elementRegistry.get('CaseFileItem_1').businessObject;
          casePlanModel = elementRegistry.get('CasePlanModel_2');

          parent = caseFileItem.businessObject.$parent;

          // when
          modeling.moveElements([ caseFileItem ], { x: 400, y: 0 }, casePlanModel);

        }));


        it('should execute', function() {
          // then
          expect(parent.get('caseFileItems')).to.be.empty;
          expect(parent.$parent).not.to.exist;
          expect(caseFileItem1.children).not.to.exist;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(parent.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(parent.$parent).to.equal(caseFileItem1);
          expect(caseFileItem1.children).to.exist;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parent.get('caseFileItems')).to.be.empty;
          expect(parent.$parent).not.to.exist;
          expect(caseFileItem1.children).not.to.exist;
        }));

      });


      describe('should add child to caseFileModel', function() {

        var caseFileModel, child;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          caseFileItem = elementRegistry.get('CaseFileItem_1');
          child = elementRegistry.get('CaseFileItem_2').businessObject;

          casePlanModel = elementRegistry.get('CasePlanModel_2');

          caseFileModel = caseFileItem.businessObject.$parent;

          // when
          modeling.moveElements([ caseFileItem ], { x: 400, y: 0 }, casePlanModel);

        }));


        it('should execute', function() {
          // then
          expect(caseFileModel.get('caseFileItems')).to.include(child);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(caseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(caseFileModel.get('caseFileItems')).not.to.include(child);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(caseFileModel.get('caseFileItems')).to.include(child);
        }));

      });


      describe('should retain child relation', function() {

        var oldCaseFileModel, newCaseFileModel, child;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          caseFileItem = elementRegistry.get('CaseFileItem_1');
          child = elementRegistry.get('CaseFileItem_2');

          casePlanModel = elementRegistry.get('CasePlanModel_2');

          oldCaseFileModel = caseFileItem.businessObject.$parent;

          // when
          modeling.moveElements([ caseFileItem, child ], { x: 400, y: 0 }, casePlanModel);

          newCaseFileModel = casePlanModel.businessObject.$parent.caseFileModel;

        }));


        it('should execute', function() {
          // then
          expect(newCaseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(newCaseFileModel.get('caseFileItems')).not.to.include(child.businessObject);

          expect(oldCaseFileModel.get('caseFileItems')).not.to.include(caseFileItem.businessObject);
          expect(oldCaseFileModel.get('caseFileItems')).not.to.include(child.businessObject);

          expect(caseFileItem.businessObject.children).to.exist;
          expect(caseFileItem.businessObject.children.get('caseFileItems')).to.include(child.businessObject);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(newCaseFileModel.get('caseFileItems')).not.to.include(caseFileItem.businessObject);
          expect(newCaseFileModel.get('caseFileItems')).not.to.include(child.businessObject);

          expect(oldCaseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(oldCaseFileModel.get('caseFileItems')).not.to.include(child.businessObject);

          expect(caseFileItem.businessObject.children).to.exist;
          expect(caseFileItem.businessObject.children.get('caseFileItems')).to.include(child.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(newCaseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
          expect(newCaseFileModel.get('caseFileItems')).not.to.include(child.businessObject);

          expect(oldCaseFileModel.get('caseFileItems')).not.to.include(caseFileItem.businessObject);
          expect(oldCaseFileModel.get('caseFileItems')).not.to.include(child.businessObject);

          expect(caseFileItem.businessObject.children).to.exist;
          expect(caseFileItem.businessObject.children.get('caseFileItems')).to.include(child.businessObject);
        }));

      });

    });

    describe('references', function() {

      var testXML = require('./CaseFileItemUpdater.references.cmmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));

      var caseFileItem1, caseFileItem2, caseFileItem3, caseFileItem4, caseFileItem5;

      describe('should clear sourceRef', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          caseFileItem1 = elementRegistry.get('CaseFileItem_1');
          caseFileItem4 = elementRegistry.get('CaseFileItem_4');

          var casePlanModel = elementRegistry.get('CasePlanModel_2');

          // when
          modeling.moveElements([ caseFileItem4 ], { x: 500, y: 0 }, casePlanModel);

        }));

        it('should execute', function() {
          // then
          expect(caseFileItem1.businessObject.get('targetRefs')).to.have.length(2);
          expect(caseFileItem1.businessObject.get('targetRefs')).not.to.include(caseFileItem4.businessObject);

          expect(caseFileItem4.businessObject.sourceRef).not.to.exist;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(caseFileItem1.businessObject.get('targetRefs')).to.have.length(3);
          expect(caseFileItem1.businessObject.get('targetRefs')).to.include(caseFileItem4.businessObject);

          expect(caseFileItem4.businessObject.sourceRef).to.equal(caseFileItem1.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // then
          expect(caseFileItem1.businessObject.get('targetRefs')).to.have.length(2);
          expect(caseFileItem1.businessObject.get('targetRefs')).not.to.include(caseFileItem4.businessObject);

          expect(caseFileItem4.businessObject.sourceRef).not.to.exist;
        }));

      });

      describe('should update references', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          caseFileItem1 = elementRegistry.get('CaseFileItem_1');
          caseFileItem2 = elementRegistry.get('CaseFileItem_2');
          caseFileItem3 = elementRegistry.get('CaseFileItem_3');
          caseFileItem4 = elementRegistry.get('CaseFileItem_4');

          var casePlanModel = elementRegistry.get('CasePlanModel_2');

          // when
          modeling.moveElements([ caseFileItem1 ], { x: 400, y: 0 }, casePlanModel);

        }));

        it('should execute', function() {
          // then
          expect(caseFileItem1.businessObject.get('targetRefs')).to.be.empty;

          expect(caseFileItem2.businessObject.sourceRef).not.to.exist;
          expect(caseFileItem3.businessObject.sourceRef).not.to.exist;
          expect(caseFileItem4.businessObject.sourceRef).not.to.exist;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(caseFileItem1.businessObject.get('targetRefs')).to.have.length(3);
          expect(caseFileItem1.businessObject.get('targetRefs')).to.include(caseFileItem2.businessObject);
          expect(caseFileItem1.businessObject.get('targetRefs')).to.include(caseFileItem3.businessObject);
          expect(caseFileItem1.businessObject.get('targetRefs')).to.include(caseFileItem4.businessObject);

          expect(caseFileItem2.businessObject.sourceRef).to.equal(caseFileItem1.businessObject);
          expect(caseFileItem3.businessObject.sourceRef).to.equal(caseFileItem1.businessObject);
          expect(caseFileItem4.businessObject.sourceRef).to.equal(caseFileItem1.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // then
          expect(caseFileItem1.businessObject.get('targetRefs')).to.be.empty;

          expect(caseFileItem2.businessObject.sourceRef).not.to.exist;
          expect(caseFileItem3.businessObject.sourceRef).not.to.exist;
          expect(caseFileItem4.businessObject.sourceRef).not.to.exist;
        }));

      });


      describe('should keep references', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          caseFileItem1 = elementRegistry.get('CaseFileItem_1');
          caseFileItem2 = elementRegistry.get('CaseFileItem_2');
          caseFileItem3 = elementRegistry.get('CaseFileItem_3');
          caseFileItem4 = elementRegistry.get('CaseFileItem_4');
          caseFileItem5 = elementRegistry.get('CaseFileItem_5');

          var casePlanModel = elementRegistry.get('CasePlanModel_2');

          // when
          modeling.moveElements([ caseFileItem1, caseFileItem4, caseFileItem5 ], { x: 500, y: 0 }, casePlanModel);

        }));

        it('should execute', function() {
          // then
          expect(caseFileItem1.businessObject.get('targetRefs')).to.have.length(1);
          expect(caseFileItem1.businessObject.get('targetRefs')).to.include(caseFileItem4.businessObject);

          expect(caseFileItem4.businessObject.sourceRef).to.equal(caseFileItem1.businessObject);

          expect(caseFileItem4.businessObject.get('targetRefs')).to.have.length(1);
          expect(caseFileItem4.businessObject.get('targetRefs')).to.include(caseFileItem5.businessObject);

          expect(caseFileItem5.businessObject.sourceRef).to.equal(caseFileItem4.businessObject);

          expect(caseFileItem2.businessObject.sourceRef).not.to.exist;
          expect(caseFileItem3.businessObject.sourceRef).not.to.exist;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(caseFileItem1.businessObject.get('targetRefs')).to.have.length(3);
          expect(caseFileItem1.businessObject.get('targetRefs')).to.include(caseFileItem2.businessObject);
          expect(caseFileItem1.businessObject.get('targetRefs')).to.include(caseFileItem3.businessObject);
          expect(caseFileItem1.businessObject.get('targetRefs')).to.include(caseFileItem4.businessObject);

          expect(caseFileItem2.businessObject.sourceRef).to.equal(caseFileItem1.businessObject);
          expect(caseFileItem3.businessObject.sourceRef).to.equal(caseFileItem1.businessObject);
          expect(caseFileItem4.businessObject.sourceRef).to.equal(caseFileItem1.businessObject);

          expect(caseFileItem4.businessObject.get('targetRefs')).to.have.length(1);
          expect(caseFileItem4.businessObject.get('targetRefs')).to.include(caseFileItem5.businessObject);

          expect(caseFileItem5.businessObject.sourceRef).to.equal(caseFileItem4.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // then
          expect(caseFileItem1.businessObject.get('targetRefs')).to.have.length(1);
          expect(caseFileItem1.businessObject.get('targetRefs')).to.include(caseFileItem4.businessObject);

          expect(caseFileItem4.businessObject.sourceRef).to.equal(caseFileItem1.businessObject);

          expect(caseFileItem4.businessObject.get('targetRefs')).to.have.length(1);
          expect(caseFileItem4.businessObject.get('targetRefs')).to.include(caseFileItem5.businessObject);

          expect(caseFileItem5.businessObject.sourceRef).to.equal(caseFileItem4.businessObject);

          expect(caseFileItem2.businessObject.sourceRef).not.to.exist;
          expect(caseFileItem3.businessObject.sourceRef).not.to.exist;
        }));

      });

    });

  });

  describe('delete', function() {

    describe('simple case file item', function() {

      var testXML = require('./CaseFileItemUpdater.simple.cmmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));

      var caseFileItem, caseFileModel;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        caseFileItem = elementRegistry.get('CaseFileItem_1');

        caseFileModel = caseFileItem.businessObject.$parent;

        // when
        modeling.removeElements([ caseFileItem ]);
      }));

      it('should execute', function() {
        // then
        expect(caseFileModel.get('caseFileItems')).not.to.include(caseFileItem.businessObject);
        expect(caseFileModel.$parent).not.to.exist;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(caseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
        expect(caseFileModel.$parent).to.exist;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(caseFileModel.get('caseFileItems')).not.to.include(caseFileItem.businessObject);
        expect(caseFileModel.$parent).not.to.exist;
      }));

    });


    describe('children', function() {

      var testXML = require('./CaseFileItemUpdater.children.cmmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));

      var caseFileItem, child, childrenElement;

      describe('should delete child', function() {

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          caseFileItem = elementRegistry.get('CaseFileItem_1');
          child = elementRegistry.get('CaseFileItem_2');

          childrenElement = caseFileItem.businessObject.children;

          // when
          modeling.removeElements([ child ]);
        }));


        it('should execute', function() {
          // then
          expect(childrenElement.get('caseFileItems')).not.to.include(child.businessObject);
          expect(childrenElement.$parent).not.to.exist;
          expect(caseFileItem.businessObject.children).not.to.exist;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(childrenElement.get('caseFileItems')).to.include(child.businessObject);
          expect(childrenElement.$parent).to.equal(caseFileItem.businessObject);
          expect(caseFileItem.businessObject.children).to.equal(childrenElement);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(childrenElement.get('caseFileItems')).not.to.include(child.businessObject);
          expect(childrenElement.$parent).not.to.exist;
          expect(caseFileItem.businessObject.children).not.to.exist;
        }));

      });


      describe('should add child to caseFileModel', function() {

        var caseFileModel;

        beforeEach(inject(function(elementRegistry, modeling) {
          // given
          caseFileItem = elementRegistry.get('CaseFileItem_1');
          child = elementRegistry.get('CaseFileItem_2');

          childrenElement = caseFileItem.businessObject.children;
          caseFileModel = caseFileItem.businessObject.$parent;

          // when
          modeling.removeElements([ caseFileItem ]);
        }));


        it('should execute', function() {
          // then
          expect(childrenElement.get('caseFileItems')).not.to.include(child.businessObject);
          expect(childrenElement.$parent).not.to.exist;
          expect(caseFileItem.businessObject.children).not.to.exist;

          expect(caseFileModel.get('caseFileItems')).to.include(child.businessObject);
          expect(caseFileModel.get('caseFileItems')).not.to.include(caseFileItem.businessObject);
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(childrenElement.get('caseFileItems')).to.include(child.businessObject);
          expect(childrenElement.$parent).to.equal(caseFileItem.businessObject);
          expect(caseFileItem.businessObject.children).to.equal(childrenElement);

          expect(caseFileModel.get('caseFileItems')).not.to.include(child.businessObject);
          expect(caseFileModel.get('caseFileItems')).to.include(caseFileItem.businessObject);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(childrenElement.get('caseFileItems')).not.to.include(child.businessObject);
          expect(childrenElement.$parent).not.to.exist;
          expect(caseFileItem.businessObject.children).not.to.exist;

          expect(caseFileModel.get('caseFileItems')).to.include(child.businessObject);
          expect(caseFileModel.get('caseFileItems')).not.to.include(caseFileItem.businessObject);
        }));

      });

    });

    describe('references', function() {

      var testXML = require('./CaseFileItemUpdater.references.cmmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));

      var source, target, caseFileItem;

      beforeEach(inject(function(elementRegistry, modeling) {
        // given
        source = elementRegistry.get('CaseFileItem_1');
        target = elementRegistry.get('CaseFileItem_5');
        caseFileItem = elementRegistry.get('CaseFileItem_4');

        // when
        modeling.removeElements([ caseFileItem ]);
      }));

      it('should execute', function() {
        // then
        expect(source.businessObject.get('targetRefs')).not.to.include(caseFileItem.businessObject);
        expect(target.businessObject.sourceRef).not.to.exist;

        expect(caseFileItem.businessObject.sourceRef).not.to.exist;
        expect(caseFileItem.businessObject.get('targetRefs')).to.be.empty;
      });

      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(source.businessObject.get('targetRefs')).to.include(caseFileItem.businessObject);
        expect(target.businessObject.sourceRef).to.equal(caseFileItem.businessObject);

        expect(caseFileItem.businessObject.sourceRef).to.equal(source.businessObject);
        expect(caseFileItem.businessObject.get('targetRefs')).to.include(target.businessObject);
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(source.businessObject.get('targetRefs')).not.to.include(caseFileItem.businessObject);
        expect(target.businessObject.sourceRef).not.to.exist;

        expect(caseFileItem.businessObject.sourceRef).not.to.exist;
        expect(caseFileItem.businessObject.get('targetRefs')).to.be.empty;
      }));

    });

  });

});
