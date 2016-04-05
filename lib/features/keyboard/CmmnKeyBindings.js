'use strict';

function CmmnKeyBindings(keyboard, spaceTool, lassoTool, handTool, editorActions) {

  var actions = {
    spaceTool: function() {
      spaceTool.toggle();
    },
    lassoTool: function() {
      lassoTool.toggle();
    },
    handTool: function() {
      handTool.toggle();
    }
  };

  editorActions.register(actions);

  keyboard.addListener(function(key, modifiers) {

    if (keyboard.hasModifier(modifiers)) {
      return;
    }

    // s -> activate space tool
    if (key === 83) {
      editorActions.trigger('spaceTool');

      return true;
    }

    // l -> activate lasso tool
    if (key === 76) {
      editorActions.trigger('lassoTool');

      return true;
    }

    // h -> activate hand tool
    if (key === 72) {
      editorActions.trigger('handTool');

      return true;
    }
  });
}

CmmnKeyBindings.$inject = [
  'keyboard',
  'spaceTool',
  'lassoTool',
  'handTool',
  'editorActions'
];

module.exports = CmmnKeyBindings;
