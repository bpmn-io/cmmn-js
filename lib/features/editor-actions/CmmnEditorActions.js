var inherits = require('inherits');

var EditorActions = require('diagram-js/lib/features/editor-actions/EditorActions').default;


/**
 * Registers and executes CMMN specific editor actions.
 *
 * @param {Injector} injector
 */
function CmmnEditorActions(injector) {
  injector.invoke(EditorActions, this);
}

inherits(CmmnEditorActions, EditorActions);

CmmnEditorActions.$inject = [
  'injector'
];

module.exports = CmmnEditorActions;


/**
 * Register default actions.
 *
 * @param {Injector} injector
 */
CmmnEditorActions.prototype._registerDefaultActions = function(injector) {

  // (0) invoke super method

  EditorActions.prototype._registerDefaultActions.call(this, injector);

  // (1) retrieve optional components to integrate with

  var canvas = injector.get('canvas', false);
  var elementRegistry = injector.get('elementRegistry', false);
  var selection = injector.get('selection', false);
  var spaceTool = injector.get('spaceTool', false);
  var lassoTool = injector.get('lassoTool', false);
  var handTool = injector.get('handTool', false);
  var globalConnect = injector.get('globalConnect', false);
  var directEditing = injector.get('directEditing', false);
  var searchPad = injector.get('searchPad', false);

  // (2) check components and register actions

  if (canvas && elementRegistry && selection) {
    this._registerAction('selectElements', function() {
      // select all elements except for the invisible
      // root element
      var rootElement = canvas.getRootElement();

      var elements = elementRegistry.filter(function(element) {
        return element !== rootElement;
      });

      selection.select(elements);

      return elements;
    });
  }

  if (spaceTool) {
    this._registerAction('spaceTool', function() {
      spaceTool.toggle();
    });
  }

  if (lassoTool) {
    this._registerAction('lassoTool', function() {
      lassoTool.toggle();
    });
  }

  if (handTool) {
    this._registerAction('handTool', function() {
      handTool.toggle();
    });
  }

  if (globalConnect) {
    this._registerAction('globalConnectTool', function() {
      globalConnect.toggle();
    });
  }

  if (selection && directEditing) {
    this._registerAction('directEditing', function() {
      var currentSelection = selection.get();

      if (currentSelection.length) {
        directEditing.activate(currentSelection[0]);
      }
    });
  }

  if (searchPad) {
    this._registerAction('find', function() {
      searchPad.toggle();
    });
  }

};