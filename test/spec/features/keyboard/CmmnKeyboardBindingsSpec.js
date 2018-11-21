'use strict';

var forEach = require('min-dash').forEach;

var coreModule = require('lib/core');
var editorActionsModule = require('lib/features/editor-actions');
var searchModule = require('lib/features/search');
var globalConnectModule = require('diagram-js/lib/features/global-connect').default;
var spaceToolModule = require('diagram-js/lib/features/space-tool').default;
var lassoToolModule = require('diagram-js/lib/features/lasso-tool').default;
var handToolModule = require('diagram-js/lib/features/hand-tool').default;
var keyboardModule = require('lib/features/keyboard');
var modelingModule = require('lib/features/modeling');
var labelEditingModule = require('lib/features/label-editing');


var createKeyEvent = require('test/util/KeyEvents').createKeyEvent;


/* global bootstrapViewer, inject, sinon */

describe('features/keyboard', function() {

  var diagramXML = require('../../../fixtures/cmmn/simple.cmmn');

  var testModules = [
    coreModule,
    editorActionsModule,
    keyboardModule,
    modelingModule,
    globalConnectModule,
    spaceToolModule,
    lassoToolModule,
    handToolModule,
    searchModule,
    labelEditingModule
  ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


  describe('cmmn keyboard bindings', function() {

    it('should include triggers inside editorActions', inject(function(editorActions) {
      // given
      var expectedActions = [
        'undo',
        'redo',
        'zoom',
        'removeSelection',
        'selectElements',
        'spaceTool',
        'lassoTool',
        'handTool',
        'globalConnectTool',
        'directEditing',
        'find'
      ];

      // then
      expect(editorActions.getActions()).to.eql(expectedActions);
    }));


    forEach(['c', 'C'], function(key) {

      it('should global connect tool for key ' + key, inject(function(keyboard, globalConnect) {

        sinon.spy(globalConnect, 'toggle');

        // given
        var e = createKeyEvent(key);

        // when
        keyboard._keyHandler(e);

        // then
        expect(globalConnect.toggle).to.have.been.calledOnce;
      }));

    });


    forEach(['l', 'L'], function(key) {

      it('should trigger lasso tool for key ' + key, inject(function(keyboard, lassoTool) {

        sinon.spy(lassoTool, 'activateSelection');

        // given
        var e = createKeyEvent(key);

        // when
        keyboard._keyHandler(e);

        // then
        expect(lassoTool.activateSelection).to.have.been.calledOnce;
      }));

    });


    forEach(['s', 'S'], function(key) {

      it('should trigger space tool', inject(function(keyboard, spaceTool) {

        sinon.spy(spaceTool, 'activateSelection');

        // given
        var e = createKeyEvent(key);

        // when
        keyboard._keyHandler(e);

        // then
        expect(spaceTool.activateSelection).to.have.been.calledOnce;
      }));

    });


    forEach(['e', 'E'], function(key) {

      it('should trigger direct editing', inject(function(keyboard, selection, elementRegistry, directEditing) {

        sinon.spy(directEditing, 'activate');

        // given
        var task = elementRegistry.get('PI_Task_1');

        selection.select(task);

        var e = createKeyEvent(key);

        // when
        keyboard._keyHandler(e);

        // then
        expect(directEditing.activate).to.have.been.calledOnce;
      }));

    });


    forEach(['a', 'A'], function(key) {

      it('should select all elements',
        inject(function(canvas, keyboard, selection, elementRegistry) {

          // given
          var e = createKeyEvent(key, { ctrlKey: true });

          var allElements = elementRegistry.getAll(),
              rootElement = canvas.getRootElement();

          // when
          keyboard._keyHandler(e);

          // then
          var selectedElements = selection.get();

          expect(selectedElements).to.have.length(allElements.length - 1);
          expect(selectedElements).not.to.contain(rootElement);
        })
      );

    });


    forEach(['f', 'F'], function(key) {

      it('should trigger search for labels', inject(function(keyboard, searchPad) {

        sinon.spy(searchPad, 'toggle');

        // given
        var e = createKeyEvent(key, { ctrlKey: true });

        // when
        keyboard._keyHandler(e);

        // then
        expect(searchPad.toggle).to.have.been.calledOnce;
      }));

    });

  });

});