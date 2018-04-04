'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

var coreModule = require('../../../../lib/core'),
    modelingModule = require('../../../../lib/features/modeling'),
    resizeModule = require('diagram-js/lib/features/resize').default;

function expectSourceWaypoint(actualWaypoints, expected) {
  assertWaypoint(actualWaypoints[0], expected);
}

function expectTargetWaypoint(actualWaypoints, expected) {
  assertWaypoint(actualWaypoints[actualWaypoints.length-1], expected);
}

function assertWaypoint(actual, expected) {
  expect(actual.x).to.equal(expected.x);
  expect(actual.y).to.equal(expected.y);
}

describe('features - resize', function() {

  var testModules = [
    coreModule,
    modelingModule,
    resizeModule
  ];

  describe('case plan model', function() {

    var diagramXML = require('./ResizeStage.cmmn');
    var casePlanModel;

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementRegistry) {
      // given
      casePlanModel = elementRegistry.get('CasePlanModel_1');
    }));

    describe('<se>', function() {

      beforeEach(inject(function(resize) {
        resize.activate(canvasEvent({ x: 925, y: 785 }), casePlanModel, 'se');
      }));

      describe('smaller', function() {

        beforeEach(inject(function(elementRegistry, resize, dragging) {
          // when
          dragging.move(canvasEvent({ x: 905, y: 765 }));
          dragging.end();
        }));

        it('should execute', function() {
          // then
          expect(casePlanModel.width).to.equal(880);
          expect(casePlanModel.height).to.equal(740);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(casePlanModel.width).to.equal(900);
          expect(casePlanModel.height).to.equal(760);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(casePlanModel.width).to.equal(880);
          expect(casePlanModel.height).to.equal(740);
        }));


        describe('move attachments', function() {

          var exitN, exitE, exitS, exitW;

          beforeEach(inject(function(elementRegistry) {
            // given
            exitN = elementRegistry.get('CasePlanModel_Exit_N');
            exitE = elementRegistry.get('CasePlanModel_Exit_E');
            exitS = elementRegistry.get('CasePlanModel_Exit_S');
            exitW = elementRegistry.get('CasePlanModel_Exit_W');
          }));

          it('should execute', function() {
            // then
            expect(exitN.x).to.equal(455);
            expect(exitN.y).to.equal(11);

            expect(exitE.x).to.equal(895);
            expect(exitE.y).to.equal(381);

            expect(exitS.x).to.equal(455);
            expect(exitS.y).to.equal(751);

            expect(exitW.x).to.equal(15);
            expect(exitW.y).to.equal(381);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(exitN.x).to.equal(465);
            expect(exitN.y).to.equal(11);

            expect(exitE.x).to.equal(915);
            expect(exitE.y).to.equal(391);

            expect(exitS.x).to.equal(465);
            expect(exitS.y).to.equal(771);

            expect(exitW.x).to.equal(15);
            expect(exitW.y).to.equal(391);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(exitN.x).to.equal(455);
            expect(exitN.y).to.equal(11);

            expect(exitE.x).to.equal(895);
            expect(exitE.y).to.equal(381);

            expect(exitS.x).to.equal(455);
            expect(exitS.y).to.equal(751);

            expect(exitW.x).to.equal(15);
            expect(exitW.y).to.equal(381);
          }));

        });


        describe('update onPart connections waypoints', function() {

          var onPart5, onPart6, onPart7, onPart8;

          beforeEach(inject(function(elementRegistry) {
            // given
            onPart5 = elementRegistry.get('OnPart_5_di');
            onPart6 = elementRegistry.get('OnPart_6_di');
            onPart7 = elementRegistry.get('OnPart_7_di');
            onPart8 = elementRegistry.get('OnPart_8_di');
          }));

          it('should execute', function() {
            // then
            expectSourceWaypoint(onPart5.waypoints, { x: 475, y: 125 });
            expectTargetWaypoint(onPart5.waypoints, { x: 465, y: 39 });

            expectSourceWaypoint(onPart6.waypoints, { x: 825, y: 405 });
            expectTargetWaypoint(onPart6.waypoints, { x: 895, y: 395 });

            expectSourceWaypoint(onPart7.waypoints, { x: 475, y: 685 });
            expectTargetWaypoint(onPart7.waypoints, { x: 465, y: 751 });

            expectSourceWaypoint(onPart8.waypoints, { x: 125, y: 405 });
            expectTargetWaypoint(onPart8.waypoints, { x: 35, y: 395 });
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expectSourceWaypoint(onPart5.waypoints, { x: 475, y: 125 });
            expectTargetWaypoint(onPart5.waypoints, { x: 475, y: 39 });

            expectSourceWaypoint(onPart6.waypoints, { x: 825, y: 405 });
            expectTargetWaypoint(onPart6.waypoints, { x: 915, y: 405 });

            expectSourceWaypoint(onPart7.waypoints, { x: 475, y: 685 });
            expectTargetWaypoint(onPart7.waypoints, { x: 475, y: 771 });

            expectSourceWaypoint(onPart8.waypoints, { x: 125, y: 405 });
            expectTargetWaypoint(onPart8.waypoints, { x: 15, y: 405 });
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectSourceWaypoint(onPart5.waypoints, { x: 475, y: 125 });
            expectTargetWaypoint(onPart5.waypoints, { x: 465, y: 39 });

            expectSourceWaypoint(onPart6.waypoints, { x: 825, y: 405 });
            expectTargetWaypoint(onPart6.waypoints, { x: 895, y: 395 });

            expectSourceWaypoint(onPart7.waypoints, { x: 475, y: 685 });
            expectTargetWaypoint(onPart7.waypoints, { x: 465, y: 751 });

            expectSourceWaypoint(onPart8.waypoints, { x: 125, y: 405 });
            expectTargetWaypoint(onPart8.waypoints, { x: 35, y: 395 });
          }));

        });

      });

      describe('bigger', function() {

        beforeEach(inject(function(elementRegistry, resize, dragging) {
          // when
          dragging.move(canvasEvent({ x: 945, y: 805 }));
          dragging.end();
        }));

        it('should execute', function() {
          // then
          expect(casePlanModel.width).to.equal(920);
          expect(casePlanModel.height).to.equal(780);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(casePlanModel.width).to.equal(900);
          expect(casePlanModel.height).to.equal(760);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(casePlanModel.width).to.equal(920);
          expect(casePlanModel.height).to.equal(780);
        }));


        describe('move attachments', function() {

          var exitN, exitE, exitS, exitW;

          beforeEach(inject(function(elementRegistry) {
            // given
            exitN = elementRegistry.get('CasePlanModel_Exit_N');
            exitE = elementRegistry.get('CasePlanModel_Exit_E');
            exitS = elementRegistry.get('CasePlanModel_Exit_S');
            exitW = elementRegistry.get('CasePlanModel_Exit_W');
          }));

          it('should execute', function() {
            // then
            expect(exitN.x).to.equal(475);
            expect(exitN.y).to.equal(11);

            expect(exitE.x).to.equal(935);
            expect(exitE.y).to.equal(401);

            expect(exitS.x).to.equal(475);
            expect(exitS.y).to.equal(791);

            expect(exitW.x).to.equal(15);
            expect(exitW.y).to.equal(401);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(exitN.x).to.equal(465);
            expect(exitN.y).to.equal(11);

            expect(exitE.x).to.equal(915);
            expect(exitE.y).to.equal(391);

            expect(exitS.x).to.equal(465);
            expect(exitS.y).to.equal(771);

            expect(exitW.x).to.equal(15);
            expect(exitW.y).to.equal(391);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(exitN.x).to.equal(475);
            expect(exitN.y).to.equal(11);

            expect(exitE.x).to.equal(935);
            expect(exitE.y).to.equal(401);

            expect(exitS.x).to.equal(475);
            expect(exitS.y).to.equal(791);

            expect(exitW.x).to.equal(15);
            expect(exitW.y).to.equal(401);
          }));

        });

        describe('update onPart connections waypoints', function() {

          var onPart5, onPart6, onPart7, onPart8;

          beforeEach(inject(function(elementRegistry) {
            // given
            onPart5 = elementRegistry.get('OnPart_5_di');
            onPart6 = elementRegistry.get('OnPart_6_di');
            onPart7 = elementRegistry.get('OnPart_7_di');
            onPart8 = elementRegistry.get('OnPart_8_di');
          }));

          it('should execute', function() {
            // then
            expectSourceWaypoint(onPart5.waypoints, { x: 475, y: 125 });
            expectTargetWaypoint(onPart5.waypoints, { x: 485, y: 39 });

            expectSourceWaypoint(onPart6.waypoints, { x: 825, y: 405 });
            expectTargetWaypoint(onPart6.waypoints, { x: 935, y: 415 });

            expectSourceWaypoint(onPart7.waypoints, { x: 475, y: 685 });
            expectTargetWaypoint(onPart7.waypoints, { x: 485, y: 791 });

            expectSourceWaypoint(onPart8.waypoints, { x: 125, y: 405 });
            expectTargetWaypoint(onPart8.waypoints, { x: 35, y: 415 });
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expectSourceWaypoint(onPart5.waypoints, { x: 475, y: 125 });
            expectTargetWaypoint(onPart5.waypoints, { x: 475, y: 39 });

            expectSourceWaypoint(onPart6.waypoints, { x: 825, y: 405 });
            expectTargetWaypoint(onPart6.waypoints, { x: 915, y: 405 });

            expectSourceWaypoint(onPart7.waypoints, { x: 475, y: 685 });
            expectTargetWaypoint(onPart7.waypoints, { x: 475, y: 771 });

            expectSourceWaypoint(onPart8.waypoints, { x: 125, y: 405 });
            expectTargetWaypoint(onPart8.waypoints, { x: 15, y: 405 });
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectSourceWaypoint(onPart5.waypoints, { x: 475, y: 125 });
            expectTargetWaypoint(onPart5.waypoints, { x: 485, y: 39 });

            expectSourceWaypoint(onPart6.waypoints, { x: 825, y: 405 });
            expectTargetWaypoint(onPart6.waypoints, { x: 935, y: 415 });

            expectSourceWaypoint(onPart7.waypoints, { x: 475, y: 685 });
            expectTargetWaypoint(onPart7.waypoints, { x: 485, y: 791 });

            expectSourceWaypoint(onPart8.waypoints, { x: 125, y: 405 });
            expectTargetWaypoint(onPart8.waypoints, { x: 35, y: 415 });
          }));

        });

      });

    });

    describe('<nw>', function() {

      beforeEach(inject(function(resize) {
        resize.activate(canvasEvent({ x: 25, y: 25 }), casePlanModel, 'nw');
      }));

      describe('smaller', function() {

        beforeEach(inject(function(elementRegistry, resize, dragging) {
          // when
          dragging.move(canvasEvent({ x: 45, y: 45 }));
          dragging.end();
        }));

        it('should execute', function() {
          // then
          expect(casePlanModel.width).to.equal(880);
          expect(casePlanModel.height).to.equal(740);

          expect(casePlanModel.x).to.equal(45);
          expect(casePlanModel.y).to.equal(45);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(casePlanModel.width).to.equal(900);
          expect(casePlanModel.height).to.equal(760);

          expect(casePlanModel.x).to.equal(25);
          expect(casePlanModel.y).to.equal(25);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(casePlanModel.width).to.equal(880);
          expect(casePlanModel.height).to.equal(740);

          expect(casePlanModel.x).to.equal(45);
          expect(casePlanModel.y).to.equal(45);
        }));


        describe('move attachments', function() {

          var exitN, exitE, exitS, exitW;

          beforeEach(inject(function(elementRegistry) {
            // given
            exitN = elementRegistry.get('CasePlanModel_Exit_N');
            exitE = elementRegistry.get('CasePlanModel_Exit_E');
            exitS = elementRegistry.get('CasePlanModel_Exit_S');
            exitW = elementRegistry.get('CasePlanModel_Exit_W');
          }));

          it('should execute', function() {
            // then
            expect(exitN.x).to.equal(475);
            expect(exitN.y).to.equal(31);

            expect(exitE.x).to.equal(915);
            expect(exitE.y).to.equal(401);

            expect(exitS.x).to.equal(475);
            expect(exitS.y).to.equal(771);

            expect(exitW.x).to.equal(35);
            expect(exitW.y).to.equal(401);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(exitN.x).to.equal(465);
            expect(exitN.y).to.equal(11);

            expect(exitE.x).to.equal(915);
            expect(exitE.y).to.equal(391);

            expect(exitS.x).to.equal(465);
            expect(exitS.y).to.equal(771);

            expect(exitW.x).to.equal(15);
            expect(exitW.y).to.equal(391);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(exitN.x).to.equal(475);
            expect(exitN.y).to.equal(31);

            expect(exitE.x).to.equal(915);
            expect(exitE.y).to.equal(401);

            expect(exitS.x).to.equal(475);
            expect(exitS.y).to.equal(771);

            expect(exitW.x).to.equal(35);
            expect(exitW.y).to.equal(401);
          }));

        });

        describe('update onPart connections waypoints', function() {

          var onPart5, onPart6, onPart7, onPart8;

          beforeEach(inject(function(elementRegistry) {
            // given
            onPart5 = elementRegistry.get('OnPart_5_di');
            onPart6 = elementRegistry.get('OnPart_6_di');
            onPart7 = elementRegistry.get('OnPart_7_di');
            onPart8 = elementRegistry.get('OnPart_8_di');
          }));

          it('should execute', function() {
            // then
            expectSourceWaypoint(onPart5.waypoints, { x: 475, y: 125 });
            expectTargetWaypoint(onPart5.waypoints, { x: 485, y: 59 });

            expectSourceWaypoint(onPart6.waypoints, { x: 825, y: 405 });
            expectTargetWaypoint(onPart6.waypoints, { x: 915, y: 415 });

            expectSourceWaypoint(onPart7.waypoints, { x: 475, y: 685 });
            expectTargetWaypoint(onPart7.waypoints, { x: 485, y: 771 });

            expectSourceWaypoint(onPart8.waypoints, { x: 125, y: 405 });
            expectTargetWaypoint(onPart8.waypoints, { x: 55, y: 415 });
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expectSourceWaypoint(onPart5.waypoints, { x: 475, y: 125 });
            expectTargetWaypoint(onPart5.waypoints, { x: 475, y: 39 });

            expectSourceWaypoint(onPart6.waypoints, { x: 825, y: 405 });
            expectTargetWaypoint(onPart6.waypoints, { x: 915, y: 405 });

            expectSourceWaypoint(onPart7.waypoints, { x: 475, y: 685 });
            expectTargetWaypoint(onPart7.waypoints, { x: 475, y: 771 });

            expectSourceWaypoint(onPart8.waypoints, { x: 125, y: 405 });
            expectTargetWaypoint(onPart8.waypoints, { x: 15, y: 405 });
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectSourceWaypoint(onPart5.waypoints, { x: 475, y: 125 });
            expectTargetWaypoint(onPart5.waypoints, { x: 485, y: 59 });

            expectSourceWaypoint(onPart6.waypoints, { x: 825, y: 405 });
            expectTargetWaypoint(onPart6.waypoints, { x: 915, y: 415 });

            expectSourceWaypoint(onPart7.waypoints, { x: 475, y: 685 });
            expectTargetWaypoint(onPart7.waypoints, { x: 485, y: 771 });

            expectSourceWaypoint(onPart8.waypoints, { x: 125, y: 405 });
            expectTargetWaypoint(onPart8.waypoints, { x: 55, y: 415 });
          }));

        });

      });

      describe('bigger', function() {

        beforeEach(inject(function(elementRegistry, resize, dragging) {
          // when
          dragging.move(canvasEvent({ x: 5, y: 5 }));
          dragging.end();
        }));

        it('should execute', function() {
          // then
          expect(casePlanModel.width).to.equal(920);
          expect(casePlanModel.height).to.equal(780);

          expect(casePlanModel.x).to.equal(5);
          expect(casePlanModel.y).to.equal(5);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(casePlanModel.width).to.equal(900);
          expect(casePlanModel.height).to.equal(760);

          expect(casePlanModel.x).to.equal(25);
          expect(casePlanModel.y).to.equal(25);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(casePlanModel.width).to.equal(920);
          expect(casePlanModel.height).to.equal(780);

          expect(casePlanModel.x).to.equal(5);
          expect(casePlanModel.y).to.equal(5);
        }));


        describe('move attachments', function() {

          var exitN, exitE, exitS, exitW;

          beforeEach(inject(function(elementRegistry) {
            // given
            exitN = elementRegistry.get('CasePlanModel_Exit_N');
            exitE = elementRegistry.get('CasePlanModel_Exit_E');
            exitS = elementRegistry.get('CasePlanModel_Exit_S');
            exitW = elementRegistry.get('CasePlanModel_Exit_W');
          }));

          it('should execute', function() {
            // then
            expect(exitN.x).to.equal(455);
            expect(exitN.y).to.equal(-9);

            expect(exitE.x).to.equal(915);
            expect(exitE.y).to.equal(381);

            expect(exitS.x).to.equal(455);
            expect(exitS.y).to.equal(771);

            expect(exitW.x).to.equal(-5);
            expect(exitW.y).to.equal(381);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(exitN.x).to.equal(465);
            expect(exitN.y).to.equal(11);

            expect(exitE.x).to.equal(915);
            expect(exitE.y).to.equal(391);

            expect(exitS.x).to.equal(465);
            expect(exitS.y).to.equal(771);

            expect(exitW.x).to.equal(15);
            expect(exitW.y).to.equal(391);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(exitN.x).to.equal(455);
            expect(exitN.y).to.equal(-9);

            expect(exitE.x).to.equal(915);
            expect(exitE.y).to.equal(381);

            expect(exitS.x).to.equal(455);
            expect(exitS.y).to.equal(771);

            expect(exitW.x).to.equal(-5);
            expect(exitW.y).to.equal(381);
          }));

        });

        describe('update onPart connections waypoints', function() {

          var onPart5, onPart6, onPart7, onPart8;

          beforeEach(inject(function(elementRegistry) {
            // given
            onPart5 = elementRegistry.get('OnPart_5_di');
            onPart6 = elementRegistry.get('OnPart_6_di');
            onPart7 = elementRegistry.get('OnPart_7_di');
            onPart8 = elementRegistry.get('OnPart_8_di');
          }));

          it('should execute', function() {
            // then
            expectSourceWaypoint(onPart5.waypoints, { x: 475, y: 125 });
            expectTargetWaypoint(onPart5.waypoints, { x: 465, y: 19 });

            expectSourceWaypoint(onPart6.waypoints, { x: 825, y: 405 });
            expectTargetWaypoint(onPart6.waypoints, { x: 915, y: 395 });

            expectSourceWaypoint(onPart7.waypoints, { x: 475, y: 685 });
            expectTargetWaypoint(onPart7.waypoints, { x: 465, y: 771 });

            expectSourceWaypoint(onPart8.waypoints, { x: 125, y: 405 });
            expectTargetWaypoint(onPart8.waypoints, { x: 15, y: 395 });
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expectSourceWaypoint(onPart5.waypoints, { x: 475, y: 125 });
            expectTargetWaypoint(onPart5.waypoints, { x: 475, y: 39 });

            expectSourceWaypoint(onPart6.waypoints, { x: 825, y: 405 });
            expectTargetWaypoint(onPart6.waypoints, { x: 915, y: 405 });

            expectSourceWaypoint(onPart7.waypoints, { x: 475, y: 685 });
            expectTargetWaypoint(onPart7.waypoints, { x: 475, y: 771 });

            expectSourceWaypoint(onPart8.waypoints, { x: 125, y: 405 });
            expectTargetWaypoint(onPart8.waypoints, { x: 15, y: 405 });
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectSourceWaypoint(onPart5.waypoints, { x: 475, y: 125 });
            expectTargetWaypoint(onPart5.waypoints, { x: 465, y: 19 });

            expectSourceWaypoint(onPart6.waypoints, { x: 825, y: 405 });
            expectTargetWaypoint(onPart6.waypoints, { x: 915, y: 395 });

            expectSourceWaypoint(onPart7.waypoints, { x: 475, y: 685 });
            expectTargetWaypoint(onPart7.waypoints, { x: 465, y: 771 });

            expectSourceWaypoint(onPart8.waypoints, { x: 125, y: 405 });
            expectTargetWaypoint(onPart8.waypoints, { x: 15, y: 395 });
          }));

        });

      });

    });

  });

  describe('stage (plan item)', function() {

    var diagramXML = require('./ResizeStage.cmmn');
    var stage;

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementRegistry) {
      // given
      stage = elementRegistry.get('PI_Stage_1');
    }));

    describe('<se>', function() {

      beforeEach(inject(function(resize) {
        resize.activate(canvasEvent({ x: 625, y: 505 }), stage, 'se');
      }));

      describe('smaller', function() {

        beforeEach(inject(function(elementRegistry, resize, dragging) {
          // when
          dragging.move(canvasEvent({ x: 605, y: 485 }));
          dragging.end();
        }));

        it('should execute', function() {
          // then
          expect(stage.width).to.equal(280);
          expect(stage.height).to.equal(180);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(stage.width).to.equal(300);
          expect(stage.height).to.equal(200);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.width).to.equal(280);
          expect(stage.height).to.equal(180);
        }));


        describe('move attachments', function() {

          var exitN, exitE, exitS, exitW;

          beforeEach(inject(function(elementRegistry) {
            // given
            exitN = elementRegistry.get('Stage_Exit_N');
            exitE = elementRegistry.get('Stage_Exit_E');
            exitS = elementRegistry.get('Stage_Exit_S');
            exitW = elementRegistry.get('Stage_Exit_W');
          }));

          it('should execute', function() {
            // then
            expect(exitN.x).to.equal(455);
            expect(exitN.y).to.equal(291);

            expect(exitE.x).to.equal(595);
            expect(exitE.y).to.equal(381);

            expect(exitS.x).to.equal(488);
            expect(exitS.y).to.equal(471);

            expect(exitW.x).to.equal(315);
            expect(exitW.y).to.equal(381);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(exitN.x).to.equal(465);
            expect(exitN.y).to.equal(291);

            expect(exitE.x).to.equal(615);
            expect(exitE.y).to.equal(391);

            expect(exitS.x).to.equal(500);
            expect(exitS.y).to.equal(491);

            expect(exitW.x).to.equal(315);
            expect(exitW.y).to.equal(391);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(exitN.x).to.equal(455);
            expect(exitN.y).to.equal(291);

            expect(exitE.x).to.equal(595);
            expect(exitE.y).to.equal(381);

            expect(exitS.x).to.equal(488);
            expect(exitS.y).to.equal(471);

            expect(exitW.x).to.equal(315);
            expect(exitW.y).to.equal(381);
          }));

        });

        describe('update onPart connections waypoints', function() {

          var onPart1, onPart2, onPart3, onPart4;

          beforeEach(inject(function(elementRegistry) {
            // given
            onPart1 = elementRegistry.get('OnPart_1_di');
            onPart2 = elementRegistry.get('OnPart_2_di');
            onPart3 = elementRegistry.get('OnPart_3_di');
            onPart4 = elementRegistry.get('OnPart_4_di');
          }));

          it('should execute', function() {
            // then
            expectSourceWaypoint(onPart1.waypoints, { x: 475, y: 205 });
            expectTargetWaypoint(onPart1.waypoints, { x: 465, y: 291 });

            expectSourceWaypoint(onPart2.waypoints, { x: 725, y: 405 });
            expectTargetWaypoint(onPart2.waypoints, { x: 615, y: 395 });

            expectSourceWaypoint(onPart3.waypoints, { x: 475, y: 605 });
            expectTargetWaypoint(onPart3.waypoints, { x: 498, y: 499 });

            expectSourceWaypoint(onPart4.waypoints, { x: 225, y: 405 });
            expectTargetWaypoint(onPart4.waypoints, { x: 315, y: 395 });
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expectSourceWaypoint(onPart1.waypoints, { x: 475, y: 205 });
            expectTargetWaypoint(onPart1.waypoints, { x: 475, y: 291 });

            expectSourceWaypoint(onPart2.waypoints, { x: 725, y: 405 });
            expectTargetWaypoint(onPart2.waypoints, { x: 635, y: 405 });

            expectSourceWaypoint(onPart3.waypoints, { x: 475, y: 605 });
            expectTargetWaypoint(onPart3.waypoints, { x: 510, y: 519 });

            expectSourceWaypoint(onPart4.waypoints, { x: 225, y: 405 });
            expectTargetWaypoint(onPart4.waypoints, { x: 315, y: 405 });
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectSourceWaypoint(onPart1.waypoints, { x: 475, y: 205 });
            expectTargetWaypoint(onPart1.waypoints, { x: 465, y: 291 });

            expectSourceWaypoint(onPart2.waypoints, { x: 725, y: 405 });
            expectTargetWaypoint(onPart2.waypoints, { x: 615, y: 395 });

            expectSourceWaypoint(onPart3.waypoints, { x: 475, y: 605 });
            expectTargetWaypoint(onPart3.waypoints, { x: 498, y: 499 });

            expectSourceWaypoint(onPart4.waypoints, { x: 225, y: 405 });
            expectTargetWaypoint(onPart4.waypoints, { x: 315, y: 395 });
          }));

        });

      });

      describe('bigger', function() {

        beforeEach(inject(function(elementRegistry, resize, dragging) {
          // when
          dragging.move(canvasEvent({ x: 645, y: 525 }));
          dragging.end();
        }));

        it('should execute', function() {
          // then
          expect(stage.width).to.equal(320);
          expect(stage.height).to.equal(220);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(stage.width).to.equal(300);
          expect(stage.height).to.equal(200);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.width).to.equal(320);
          expect(stage.height).to.equal(220);
        }));

        describe('move attachments', function() {

          var exitN, exitE, exitS, exitW;

          beforeEach(inject(function(elementRegistry) {
            // given
            exitN = elementRegistry.get('Stage_Exit_N');
            exitE = elementRegistry.get('Stage_Exit_E');
            exitS = elementRegistry.get('Stage_Exit_S');
            exitW = elementRegistry.get('Stage_Exit_W');
          }));

          it('should execute', function() {
            // then
            expect(exitN.x).to.equal(475);
            expect(exitN.y).to.equal(291);

            expect(exitE.x).to.equal(635);
            expect(exitE.y).to.equal(401);

            expect(exitS.x).to.equal(512);
            expect(exitS.y).to.equal(511);

            expect(exitW.x).to.equal(315);
            expect(exitW.y).to.equal(401);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(exitN.x).to.equal(465);
            expect(exitN.y).to.equal(291);

            expect(exitE.x).to.equal(615);
            expect(exitE.y).to.equal(391);

            expect(exitS.x).to.equal(500);
            expect(exitS.y).to.equal(491);

            expect(exitW.x).to.equal(315);
            expect(exitW.y).to.equal(391);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(exitN.x).to.equal(475);
            expect(exitN.y).to.equal(291);

            expect(exitE.x).to.equal(635);
            expect(exitE.y).to.equal(401);

            expect(exitS.x).to.equal(512);
            expect(exitS.y).to.equal(511);

            expect(exitW.x).to.equal(315);
            expect(exitW.y).to.equal(401);
          }));

        });

        describe('update onPart connections waypoints', function() {

          var onPart1, onPart2, onPart3, onPart4;

          beforeEach(inject(function(elementRegistry) {
            // given
            onPart1 = elementRegistry.get('OnPart_1_di');
            onPart2 = elementRegistry.get('OnPart_2_di');
            onPart3 = elementRegistry.get('OnPart_3_di');
            onPart4 = elementRegistry.get('OnPart_4_di');
          }));

          it('should execute', function() {
            // then
            expectSourceWaypoint(onPart1.waypoints, { x: 475, y: 205 });
            expectTargetWaypoint(onPart1.waypoints, { x: 485, y: 291 });

            expectSourceWaypoint(onPart2.waypoints, { x: 725, y: 405 });
            expectTargetWaypoint(onPart2.waypoints, { x: 655, y: 415 });

            expectSourceWaypoint(onPart3.waypoints, { x: 475, y: 605 });
            expectTargetWaypoint(onPart3.waypoints, { x: 522, y: 539 });

            expectSourceWaypoint(onPart4.waypoints, { x: 225, y: 405 });
            expectTargetWaypoint(onPart4.waypoints, { x: 315, y: 415 });
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expectSourceWaypoint(onPart1.waypoints, { x: 475, y: 205 });
            expectTargetWaypoint(onPart1.waypoints, { x: 475, y: 291 });

            expectSourceWaypoint(onPart2.waypoints, { x: 725, y: 405 });
            expectTargetWaypoint(onPart2.waypoints, { x: 635, y: 405 });

            expectSourceWaypoint(onPart3.waypoints, { x: 475, y: 605 });
            expectTargetWaypoint(onPart3.waypoints, { x: 510, y: 519 });

            expectSourceWaypoint(onPart4.waypoints, { x: 225, y: 405 });
            expectTargetWaypoint(onPart4.waypoints, { x: 315, y: 405 });
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectSourceWaypoint(onPart1.waypoints, { x: 475, y: 205 });
            expectTargetWaypoint(onPart1.waypoints, { x: 485, y: 291 });

            expectSourceWaypoint(onPart2.waypoints, { x: 725, y: 405 });
            expectTargetWaypoint(onPart2.waypoints, { x: 655, y: 415 });

            expectSourceWaypoint(onPart3.waypoints, { x: 475, y: 605 });
            expectTargetWaypoint(onPart3.waypoints, { x: 522, y: 539 });

            expectSourceWaypoint(onPart4.waypoints, { x: 225, y: 405 });
            expectTargetWaypoint(onPart4.waypoints, { x: 315, y: 415 });
          }));

        });

      });

    });

    describe('<nw>', function() {

      beforeEach(inject(function(resize) {
        resize.activate(canvasEvent({ x: 325, y: 305 }), stage, 'nw');
      }));

      describe('smaller', function() {

        beforeEach(inject(function(elementRegistry, resize, dragging) {
          // when
          dragging.move(canvasEvent({ x: 345, y: 325 }));
          dragging.end();
        }));

        it('should execute', function() {
          // then
          expect(stage.width).to.equal(280);
          expect(stage.height).to.equal(180);

          expect(stage.x).to.equal(345);
          expect(stage.y).to.equal(325);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(stage.width).to.equal(300);
          expect(stage.height).to.equal(200);

          expect(stage.x).to.equal(325);
          expect(stage.y).to.equal(305);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.width).to.equal(280);
          expect(stage.height).to.equal(180);

          expect(stage.x).to.equal(345);
          expect(stage.y).to.equal(325);
        }));


        describe('move attachments', function() {

          var exitN, exitE, exitS, exitW;

          beforeEach(inject(function(elementRegistry) {
            // given
            exitN = elementRegistry.get('Stage_Exit_N');
            exitE = elementRegistry.get('Stage_Exit_E');
            exitS = elementRegistry.get('Stage_Exit_S');
            exitW = elementRegistry.get('Stage_Exit_W');
          }));

          it('should execute', function() {
            // then
            expect(exitN.x).to.equal(475);
            expect(exitN.y).to.equal(311);

            expect(exitE.x).to.equal(615);
            expect(exitE.y).to.equal(401);

            expect(exitS.x).to.equal(508);
            expect(exitS.y).to.equal(491);

            expect(exitW.x).to.equal(335);
            expect(exitW.y).to.equal(401);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(exitN.x).to.equal(465);
            expect(exitN.y).to.equal(291);

            expect(exitE.x).to.equal(615);
            expect(exitE.y).to.equal(391);

            expect(exitS.x).to.equal(500);
            expect(exitS.y).to.equal(491);

            expect(exitW.x).to.equal(315);
            expect(exitW.y).to.equal(391);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(exitN.x).to.equal(475);
            expect(exitN.y).to.equal(311);

            expect(exitE.x).to.equal(615);
            expect(exitE.y).to.equal(401);

            expect(exitS.x).to.equal(508);
            expect(exitS.y).to.equal(491);

            expect(exitW.x).to.equal(335);
            expect(exitW.y).to.equal(401);
          }));

        });

        describe('update onPart connections waypoints', function() {

          var onPart1, onPart2, onPart3, onPart4;

          beforeEach(inject(function(elementRegistry) {
            // given
            onPart1 = elementRegistry.get('OnPart_1_di');
            onPart2 = elementRegistry.get('OnPart_2_di');
            onPart3 = elementRegistry.get('OnPart_3_di');
            onPart4 = elementRegistry.get('OnPart_4_di');
          }));

          it('should execute', function() {
            // then
            expectSourceWaypoint(onPart1.waypoints, { x: 475, y: 205 });
            expectTargetWaypoint(onPart1.waypoints, { x: 485, y: 311 });

            expectSourceWaypoint(onPart2.waypoints, { x: 725, y: 405 });
            expectTargetWaypoint(onPart2.waypoints, { x: 635, y: 415 });

            expectSourceWaypoint(onPart3.waypoints, { x: 475, y: 605 });
            expectTargetWaypoint(onPart3.waypoints, { x: 518, y: 519 });

            expectSourceWaypoint(onPart4.waypoints, { x: 225, y: 405 });
            expectTargetWaypoint(onPart4.waypoints, { x: 335, y: 415 });
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expectSourceWaypoint(onPart1.waypoints, { x: 475, y: 205 });
            expectTargetWaypoint(onPart1.waypoints, { x: 475, y: 291 });

            expectSourceWaypoint(onPart2.waypoints, { x: 725, y: 405 });
            expectTargetWaypoint(onPart2.waypoints, { x: 635, y: 405 });

            expectSourceWaypoint(onPart3.waypoints, { x: 475, y: 605 });
            expectTargetWaypoint(onPart3.waypoints, { x: 510, y: 519 });

            expectSourceWaypoint(onPart4.waypoints, { x: 225, y: 405 });
            expectTargetWaypoint(onPart4.waypoints, { x: 315, y: 405 });
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectSourceWaypoint(onPart1.waypoints, { x: 475, y: 205 });
            expectTargetWaypoint(onPart1.waypoints, { x: 485, y: 311 });

            expectSourceWaypoint(onPart2.waypoints, { x: 725, y: 405 });
            expectTargetWaypoint(onPart2.waypoints, { x: 635, y: 415 });

            expectSourceWaypoint(onPart3.waypoints, { x: 475, y: 605 });
            expectTargetWaypoint(onPart3.waypoints, { x: 518, y: 519 });

            expectSourceWaypoint(onPart4.waypoints, { x: 225, y: 405 });
            expectTargetWaypoint(onPart4.waypoints, { x: 335, y: 415 });
          }));

        });

      });

      describe('bigger', function() {

        beforeEach(inject(function(elementRegistry, resize, dragging) {
          // when
          dragging.move(canvasEvent({ x: 305, y: 285 }));
          dragging.end();
        }));

        it('should execute', function() {
          // then
          expect(stage.width).to.equal(320);
          expect(stage.height).to.equal(220);

          expect(stage.x).to.equal(305);
          expect(stage.y).to.equal(285);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(stage.width).to.equal(300);
          expect(stage.height).to.equal(200);

          expect(stage.x).to.equal(325);
          expect(stage.y).to.equal(305);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.width).to.equal(320);
          expect(stage.height).to.equal(220);

          expect(stage.x).to.equal(305);
          expect(stage.y).to.equal(285);
        }));


        describe('move attachments', function() {

          var exitN, exitE, exitS, exitW;

          beforeEach(inject(function(elementRegistry) {
            // given
            exitN = elementRegistry.get('Stage_Exit_N');
            exitE = elementRegistry.get('Stage_Exit_E');
            exitS = elementRegistry.get('Stage_Exit_S');
            exitW = elementRegistry.get('Stage_Exit_W');
          }));

          it('should execute', function() {
            // then
            expect(exitN.x).to.equal(455);
            expect(exitN.y).to.equal(271);

            expect(exitE.x).to.equal(615);
            expect(exitE.y).to.equal(381);

            expect(exitS.x).to.equal(492);
            expect(exitS.y).to.equal(491);

            expect(exitW.x).to.equal(295);
            expect(exitW.y).to.equal(381);
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expect(exitN.x).to.equal(465);
            expect(exitN.y).to.equal(291);

            expect(exitE.x).to.equal(615);
            expect(exitE.y).to.equal(391);

            expect(exitS.x).to.equal(500);
            expect(exitS.y).to.equal(491);

            expect(exitW.x).to.equal(315);
            expect(exitW.y).to.equal(391);
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(exitN.x).to.equal(455);
            expect(exitN.y).to.equal(271);

            expect(exitE.x).to.equal(615);
            expect(exitE.y).to.equal(381);

            expect(exitS.x).to.equal(492);
            expect(exitS.y).to.equal(491);

            expect(exitW.x).to.equal(295);
            expect(exitW.y).to.equal(381);
          }));

        });

        describe('update onPart connections waypoints', function() {

          var onPart1, onPart2, onPart3, onPart4;

          beforeEach(inject(function(elementRegistry) {
            // given
            onPart1 = elementRegistry.get('OnPart_1_di');
            onPart2 = elementRegistry.get('OnPart_2_di');
            onPart3 = elementRegistry.get('OnPart_3_di');
            onPart4 = elementRegistry.get('OnPart_4_di');
          }));

          it('should execute', function() {
            // then
            expectSourceWaypoint(onPart1.waypoints, { x: 475, y: 205 });
            expectTargetWaypoint(onPart1.waypoints, { x: 465, y: 271 });

            expectSourceWaypoint(onPart2.waypoints, { x: 725, y: 405 });
            expectTargetWaypoint(onPart2.waypoints, { x: 635, y: 395 });

            expectSourceWaypoint(onPart3.waypoints, { x: 475, y: 605 });
            expectTargetWaypoint(onPart3.waypoints, { x: 502, y: 519 });

            expectSourceWaypoint(onPart4.waypoints, { x: 225, y: 405 });
            expectTargetWaypoint(onPart4.waypoints, { x: 295, y: 395 });
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expectSourceWaypoint(onPart1.waypoints, { x: 475, y: 205 });
            expectTargetWaypoint(onPart1.waypoints, { x: 475, y: 291 });

            expectSourceWaypoint(onPart2.waypoints, { x: 725, y: 405 });
            expectTargetWaypoint(onPart2.waypoints, { x: 635, y: 405 });

            expectSourceWaypoint(onPart3.waypoints, { x: 475, y: 605 });
            expectTargetWaypoint(onPart3.waypoints, { x: 510, y: 519 });

            expectSourceWaypoint(onPart4.waypoints, { x: 225, y: 405 });
            expectTargetWaypoint(onPart4.waypoints, { x: 315, y: 405 });
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectSourceWaypoint(onPart1.waypoints, { x: 475, y: 205 });
            expectTargetWaypoint(onPart1.waypoints, { x: 465, y: 271 });

            expectSourceWaypoint(onPart2.waypoints, { x: 725, y: 405 });
            expectTargetWaypoint(onPart2.waypoints, { x: 635, y: 395 });

            expectSourceWaypoint(onPart3.waypoints, { x: 475, y: 605 });
            expectTargetWaypoint(onPart3.waypoints, { x: 502, y: 519 });

            expectSourceWaypoint(onPart4.waypoints, { x: 225, y: 405 });
            expectTargetWaypoint(onPart4.waypoints, { x: 295, y: 395 });
          }));

        });

      });

    });

  });

  describe('stage (discretionary item)', function() {

    var diagramXML = require('./ResizeStage.discretionary.cmmn');
    var stage;

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementRegistry) {
      // given
      stage = elementRegistry.get('DIS_Stage_1');
    }));

    describe('<se>', function() {

      beforeEach(inject(function(resize) {
        resize.activate(canvasEvent({ x: 265, y: 505 }), stage, 'se');
      }));

      describe('smaller', function() {

        beforeEach(inject(function(elementRegistry, resize, dragging) {
          // when
          dragging.move(canvasEvent({ x: 245, y: 485 }));
          dragging.end();
        }));

        it('should execute', function() {
          // then
          expect(stage.width).to.equal(280);
          expect(stage.height).to.equal(180);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(stage.width).to.equal(300);
          expect(stage.height).to.equal(200);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.width).to.equal(280);
          expect(stage.height).to.equal(180);
        }));


        describe('update discretionary connection waypoints', function() {

          var discretionaryConnection;

          beforeEach(inject(function(elementRegistry) {
            // given
            discretionaryConnection = elementRegistry.get('DiscretionaryConnection_1');
          }));

          it('should execute', function() {
            // then
            expectSourceWaypoint(discretionaryConnection.waypoints, { x: 165, y: 165 });
            expectTargetWaypoint(discretionaryConnection.waypoints, { x: 245, y: 155 });
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expectSourceWaypoint(discretionaryConnection.waypoints, { x: 165, y: 165 });
            expectTargetWaypoint(discretionaryConnection.waypoints, { x: 245, y: 165 });
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectSourceWaypoint(discretionaryConnection.waypoints, { x: 165, y: 165 });
            expectTargetWaypoint(discretionaryConnection.waypoints, { x: 245, y: 155 });
          }));

        });

      });

      describe('bigger', function() {

        beforeEach(inject(function(elementRegistry, resize, dragging) {
          // when
          dragging.move(canvasEvent({ x: 285, y: 525 }));
          dragging.end();
        }));

        it('should execute', function() {
          // then
          expect(stage.width).to.equal(320);
          expect(stage.height).to.equal(220);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(stage.width).to.equal(300);
          expect(stage.height).to.equal(200);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.width).to.equal(320);
          expect(stage.height).to.equal(220);
        }));


        describe('update discretionary connection waypoints', function() {

          var discretionaryConnection;

          beforeEach(inject(function(elementRegistry) {
            // given
            discretionaryConnection = elementRegistry.get('DiscretionaryConnection_1');
          }));

          it('should execute', function() {
            // then
            expectSourceWaypoint(discretionaryConnection.waypoints, { x: 165, y: 165 });
            expectTargetWaypoint(discretionaryConnection.waypoints, { x: 245, y: 175 });
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expectSourceWaypoint(discretionaryConnection.waypoints, { x: 165, y: 165 });
            expectTargetWaypoint(discretionaryConnection.waypoints, { x: 245, y: 165 });
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectSourceWaypoint(discretionaryConnection.waypoints, { x: 165, y: 165 });
            expectTargetWaypoint(discretionaryConnection.waypoints, { x: 245, y: 175 });
          }));

        });

      });

    });

    describe('<nw>', function() {

      beforeEach(inject(function(resize) {
        resize.activate(canvasEvent({ x: 245, y: 65 }), stage, 'nw');
      }));

      describe('smaller', function() {

        beforeEach(inject(function(elementRegistry, resize, dragging) {
          // when
          dragging.move(canvasEvent({ x: 265, y: 85 }));
          dragging.end();
        }));

        it('should execute', function() {
          // then
          expect(stage.width).to.equal(280);
          expect(stage.height).to.equal(180);

          expect(stage.x).to.equal(265);
          expect(stage.y).to.equal(85);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(stage.width).to.equal(300);
          expect(stage.height).to.equal(200);

          expect(stage.x).to.equal(245);
          expect(stage.y).to.equal(65);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.width).to.equal(280);
          expect(stage.height).to.equal(180);

          expect(stage.x).to.equal(265);
          expect(stage.y).to.equal(85);
        }));


        describe('update discretionary connection waypoints', function() {

          var discretionaryConnection;

          beforeEach(inject(function(elementRegistry) {
            // given
            discretionaryConnection = elementRegistry.get('DiscretionaryConnection_1');
          }));

          it('should execute', function() {
            // then
            expectSourceWaypoint(discretionaryConnection.waypoints, { x: 165, y: 165 });
            expectTargetWaypoint(discretionaryConnection.waypoints, { x: 265, y: 175 });
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expectSourceWaypoint(discretionaryConnection.waypoints, { x: 165, y: 165 });
            expectTargetWaypoint(discretionaryConnection.waypoints, { x: 245, y: 165 });
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectSourceWaypoint(discretionaryConnection.waypoints, { x: 165, y: 165 });
            expectTargetWaypoint(discretionaryConnection.waypoints, { x: 265, y: 175 });
          }));

        });

      });

      describe('bigger', function() {

        beforeEach(inject(function(elementRegistry, resize, dragging) {
          // when
          dragging.move(canvasEvent({ x: 225, y: 45 }));
          dragging.end();
        }));

        it('should execute', function() {
          // then
          expect(stage.width).to.equal(320);
          expect(stage.height).to.equal(220);

          expect(stage.x).to.equal(225);
          expect(stage.y).to.equal(45);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(stage.width).to.equal(300);
          expect(stage.height).to.equal(200);

          expect(stage.x).to.equal(245);
          expect(stage.y).to.equal(65);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(stage.width).to.equal(320);
          expect(stage.height).to.equal(220);

          expect(stage.x).to.equal(225);
          expect(stage.y).to.equal(45);
        }));


        describe('update discretionary connection waypoints', function() {

          var discretionaryConnection;

          beforeEach(inject(function(elementRegistry) {
            // given
            discretionaryConnection = elementRegistry.get('DiscretionaryConnection_1');
          }));

          it('should execute', function() {
            // then
            expectSourceWaypoint(discretionaryConnection.waypoints, { x: 165, y: 165 });
            expectTargetWaypoint(discretionaryConnection.waypoints, { x: 225, y: 155 });
          });


          it('should undo', inject(function(commandStack) {
            // when
            commandStack.undo();

            // then
            expectSourceWaypoint(discretionaryConnection.waypoints, { x: 165, y: 165 });
            expectTargetWaypoint(discretionaryConnection.waypoints, { x: 245, y: 165 });
          }));


          it('should redo', inject(function(commandStack) {
            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectSourceWaypoint(discretionaryConnection.waypoints, { x: 165, y: 165 });
            expectTargetWaypoint(discretionaryConnection.waypoints, { x: 225, y: 155 });
          }));

        });

      });

    });

  });

});
