'use strict';

var inherits = require('inherits');

var Ids = require('ids');

var Viewer = require('./Viewer');

var NavigatedViewer = require('./NavigatedViewer');

var initialDiagram = '<?xml version="1.0" encoding="UTF-8"?>' +
  '<cmmn:definitions xmlns:dc="http://www.omg.org/spec/CMMN/20151109/DC" ' +
                    'xmlns:di="http://www.omg.org/spec/CMMN/20151109/DI" ' +
                    'xmlns:cmmndi="http://www.omg.org/spec/CMMN/20151109/CMMNDI" ' +
                    'xmlns:cmmn="http://www.omg.org/spec/CMMN/20151109/MODEL" ' +
                    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Test" ' +
                    'targetNamespace="http://bpmn.io/schema/cmmn">' +
    '<cmmn:case id="Case_1">' +
      '<cmmn:casePlanModel id="CasePlanModel_1" name="A CasePlanModel">' +
        '<cmmn:planItem id="PlanItem_1" definitionRef="Task_1" />' +
        '<cmmn:task id="Task_1" />' +
      '</cmmn:casePlanModel>' +
    '</cmmn:case>' +
    '<cmmndi:CMMNDI>' +
      '<cmmndi:CMMNDiagram id="CMMNDiagram_1">' +
        '<cmmndi:Size width="500" height="500" />' +
        '<cmmndi:CMMNShape id="DI_CasePlanModel_1" cmmnElementRef="CasePlanModel_1">' +
          '<dc:Bounds x="114" y="63" width="534" height="389" />' +
          '<cmmndi:CMMNLabel />' +
        '</cmmndi:CMMNShape>' +
        '<cmmndi:CMMNShape id="PlanItem_1_di" cmmnElementRef="PlanItem_1">' +
          '<dc:Bounds x="150" y="96" width="100" height="80" />' +
          '<cmmndi:CMMNLabel />' +
        '</cmmndi:CMMNShape>' +
      '</cmmndi:CMMNDiagram>' +
    '</cmmndi:CMMNDI>' +
  '</cmmn:definitions>';

/**
 * A modeler for CMMN 1.1 diagrams.
 *
 * Have a look at {@link NavigatedViewer} or {@link Modeler} for bundles that include
 * additional features.

 *
 * ## Extending the Modeler
 *
 * In order to extend the viewer pass extension modules to bootstrap via the
 * `additionalModules` option. An extension module is an object that exposes
 * named services.
 *
 * The following example depicts the integration of a simple
 * logging component that integrates with interaction events:
 *
 *
 * ```javascript
 *
 * // logging component
 * function InteractionLogger(eventBus) {
 *   eventBus.on('element.hover', function(event) {
 *     console.log()
 *   })
 * }
 *
 * InteractionLogger.$inject = [ 'eventBus' ]; // minification save
 *
 * // extension module
 * var extensionModule = {
 *   __init__: [ 'interactionLogger' ],
 *   interactionLogger: [ 'type', InteractionLogger ]
 * };
 *
 * // extend the viewer
 * var cmmnModeler = new Modeler({ additionalModules: [ extensionModule ] });
 * cmmnModeler.importXML(...);
 * ```
 *
 *
 * ## Customizing / Replacing Components
 *
 * You can replace individual diagram components by redefining them in override modules.
 * This works for all components, including those defined in the core.
 *
 * Pass in override modules via the `options.additionalModules` flag like this:
 *
 * ```javascript
 * function CustomContextPadProvider(contextPad) {
 *
 *   contextPad.registerProvider(this);
 *
 *   this.getContextPadEntries = function(element) {
 *     // no entries, effectively disable the context pad
 *     return {};
 *   };
 * }
 *
 * CustomContextPadProvider.$inject = [ 'contextPad' ];
 *
 * var overrideModule = {
 *   contextPadProvider: [ 'type', CustomContextPadProvider ]
 * };
 *
 * var cmmnModeler = new Modeler({ additionalModules: [ overrideModule ]});
 * ```
 *
 * @param {Object} [options] configuration options to pass to the viewer
 * @param {DOMElement} [options.container] the container to attach to
 * @param {String|Number} [options.width] the width of the viewer
 * @param {String|Number} [options.height] the height of the viewer
 * @param {Object} [options.moddleExtensions] extension packages to provide
 * @param {Array<didi.Module>} [options.modules] a list of modules to override the default modules
 * @param {Array<didi.Module>} [options.additionalModules] a list of modules to use with the default modules
 */
function Modeler(options) {
  Viewer.call(this, options);

  // hook ID collection into the modeler
  this.on('import.parse.complete', function(event) {
    if (!event.error) {
      this._collectIds(event.definitions, event.context);
    }
  }, this);

  this.on('diagram.destroy', function() {
    this.get('moddle').ids.clear();
  }, this);
}

inherits(Modeler, Viewer);

module.exports = Modeler;

module.exports.Viewer = Viewer;

module.exports.NavigatedViewer = NavigatedViewer;

/**
 * Create a new diagram to start modeling.
 *
 * @param {Function} [done]
 */
Modeler.prototype.createDiagram = function(done) {
  return this.importXML(initialDiagram, done);
};

/**
 * Create a moddle instance, attaching ids to it.
 *
 * @param {Object} options
 */
Modeler.prototype._createModdle = function(options) {
  var moddle = Viewer.prototype._createModdle.call(this, options);

  // attach ids to moddle to be able to track
  // and validated ids in the CMMN 1.1 XML document
  // tree
  moddle.ids = new Ids([ 32, 36, 1 ]);

  return moddle;
};

/**
 * Collect ids processed during parsing of the
 * definitions object.
 *
 * @param {ModdleElement} definitions
 * @param {Context} context
 */
Modeler.prototype._collectIds = function(definitions, context) {

  var moddle = definitions.$model,
      ids = moddle.ids,
      id;

  // remove references from previous import
  ids.clear();

  for (id in context.elementsById) {
    ids.claim(id, context.elementsById[id]);
  }
};


Modeler.prototype._interactionModules = [
  // non-modeling components
  require('diagram-js/lib/features/auto-scroll').default,
  require('diagram-js/lib/navigation/keyboard-move').default,
  require('diagram-js/lib/navigation/movecanvas').default,
  require('diagram-js/lib/navigation/zoomscroll').default,
  require('./features/outline')
];

Modeler.prototype._modelingModules = [
  // modeling components
  require('diagram-js/lib/features/bendpoints').default,
  require('diagram-js/lib/features/keyboard-move-selection').default,
  require('diagram-js/lib/features/move').default,
  require('diagram-js/lib/features/resize').default,
  require('diagram-js/lib/features/connection-preview').default,
  require('./features/auto-resize'),
  require('./features/context-pad'),
  require('./features/editor-actions'),
  require('./features/keyboard'),
  require('./features/label-editing'),
  require('./features/modeling'),
  require('./features/palette'),
  require('./features/snapping'),
  require('./features/search'),
  require('./features/replace-preview')
];


// modules the modeler is composed of
//
// - viewer modules
// - interaction modules
// - modeling modules

Modeler.prototype._modules = [].concat(
  Modeler.prototype._modules,
  Modeler.prototype._interactionModules,
  Modeler.prototype._modelingModules);