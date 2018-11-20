var EditorActionsModule = require('diagram-js/lib/features/editor-actions').default;

var CmmnEditorActions = require('./CmmnEditorActions');

module.exports = {
  __depends__: [
    EditorActionsModule
  ],
  editorActions: [ 'type', CmmnEditorActions ]
};
