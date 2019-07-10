'use strict';

/* global bootstrapModeler, inject */

var connectionPreviewModule = require('diagram-js/lib/features/connection-preview').default,
    bendpointsModule = require('diagram-js/lib/features/bendpoints').default,
    connectModule = require('diagram-js/lib/features/connect').default,
    modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core'),
    createModule = require('diagram-js/lib/features/create').default,
    canvasEvent = require('../../../util/MockEvents').createCanvasEvent;


describe('features/modeling CmmnLayouter', function() {

  var testModules = [
    connectionPreviewModule,
    connectModule,
    bendpointsModule,
    coreModule,
    createModule,
    modelingModule ];


  describe('integration', function() {

    describe('connection preview', function() {

      var testXML = require('./CmmnLayouter.connections.cmmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));

      it('should correctly lay out new connection preview',
        inject(function(connect, dragging, elementRegistry) {

          // given
          var source = elementRegistry.get('EntryCriterion_1'),
              target = elementRegistry.get('PlanItem_B');

          // when
          connect.start(canvasEvent({ x: 327, y: 187 }), source);

          dragging.move(canvasEvent({ x: 480, y: 300 }));
          dragging.hover({ element: target });
          dragging.move(canvasEvent({ x: 500, y: 240 }));

          var ctx = dragging.context();
          var context = ctx.data.context;

          var connectionPreview = context.getConnection(
            context.canExecute,
            context.source,
            context.target
          );

          var waypointsPreview = connectionPreview.waypoints.slice();

          dragging.end();

          // source <-> target got reversed meanwhile
          var waypointsFinal = target.outgoing[0].waypoints.reverse();

          // then
          expect(waypointsFinal).to.exist;
          expect(waypointsFinal).to.deep.eql(waypointsPreview);
        })
      );


      it('should correctly lay out connection preview on reconnect start',
        inject(function(canvas, bendpointMove, dragging, elementRegistry) {

        // given
          var target = elementRegistry.get('PlanItem_B'),
              targetGfx = canvas.getGraphics(target),
              connection = elementRegistry.get('PlanItemOnPart_1_di');

          // when
          bendpointMove.start(canvasEvent({ x: 595, y: 200 }), connection, 0);

          dragging.move(canvasEvent({ x: 480, y: 300 }));
          dragging.hover({ element: target, gfx: targetGfx });
          dragging.move(canvasEvent({ x: 500, y: 240 }));

          var ctx = dragging.context();
          var context = ctx.data.context;

          var connectionPreview = context.getConnection(
            context.allowed,
            context.source,
            context.target
          );

          var waypointsPreview = connectionPreview.waypoints.slice();

          dragging.end();

          // then
          expect(target.outgoing[0]).to.exist;
          expect(target.outgoing[0].waypoints).to.deep.eql(waypointsPreview);
        })
      );


      it('should correctly lay out connection preview on reconnect end',
        inject(function(canvas, bendpointMove, dragging, elementRegistry) {

          // given
          var target = elementRegistry.get('EntryCriterion_2'),
              targetGfx = canvas.getGraphics(target),
              connection = elementRegistry.get('PlanItemOnPart_1_di');

          // when
          bendpointMove.start(canvasEvent({ x: 347, y: 201 }), connection, 1);

          dragging.move(canvasEvent({ x: 560, y: 270 }));
          dragging.hover({ element: target, gfx: targetGfx });
          dragging.move(canvasEvent({ x: 560, y: 270 }));

          var ctx = dragging.context();
          var context = ctx.data.context;

          var connectionPreview = context.getConnection(
            context.allowed,
            context.source,
            context.target
          );

          var waypointsPreview = connectionPreview.waypoints.slice();

          dragging.end();

          // then
          expect(target.incoming[0]).to.exist;
          expect(target.incoming[0].waypoints).to.deep.eql(waypointsPreview);
        })
      );

    });

  });

});
