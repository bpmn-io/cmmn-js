'use strict';

var CmmnTreeWalker = require('./CmmnTreeWalker');


/**
 * Import the definitions into a diagram.
 *
 * Errors and warnings are reported through the specified callback.
 *
 * @param  {Diagram} diagram
 * @param  {ModdleElement} definitions
 * @param  {Function} done the callback, invoked with (err, [ warning ]) once the import is done
 */
function importCmmnDiagram(diagram, definitions, done) {

  var importer = diagram.get('cmmnImporter'),
      eventBus = diagram.get('eventBus'),
      itemRegistry = diagram.get('itemRegistry');

  var error,
      warnings = [];

  /**
   * Walk the diagram semantically, importing (=drawing)
   * all elements you encounter.
   *
   * @param {ModdleElement} definitions
   */
  function render(definitions) {

    var visitor = {

      root: function(element) {
        return importer.root(element);
      },

      element: function(element, parentShape) {
        return importer.add(element, parentShape);
      },

      error: function(message, context) {
        warnings.push({ message: message, context: context });
      },

      addItem: function(item) {
        itemRegistry.add(item);
      }
    };

    var walker = new CmmnTreeWalker(visitor);

    // import
    walker.handleDefinitions(definitions);
  }

  eventBus.fire('import.render.start', { definitions: definitions });

  try {
    render(definitions);
  } catch (e) {
    error = e;
  }

  eventBus.fire('import.render.complete', {
    error: error,
    warnings: warnings
  });

  done(error, warnings);
}

module.exports.importCmmnDiagram = importCmmnDiagram;