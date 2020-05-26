/**
 * The code in the <project-logo></project-logo> area
 * must not be changed.
 *
 * @see http://bpmn.io/license for more information.
 */
'use strict';

var assign = require('min-dash').assign,
    omit = require('min-dash').omit,
    isNumber = require('min-dash').isNumber;

var inherits = require('inherits');

var domify = require('min-dom').domify,
    domQuery = require('min-dom').query,
    domRemove = require('min-dom').remove;

var innerSVG = require('tiny-svg').innerSVG;

var Diagram = require('diagram-js').default,
    CmmnModdle = require('cmmn-moddle').default;

var Importer = require('./import/Importer');


function checkValidationError(err) {

  // check if we can help the user by indicating wrong CMMN 1.1 xml
  // (in case he or the exporting tool did not get that right)

  var pattern = /unparsable content <([^>]+)> detected([\s\S]*)$/;
  var match = pattern.exec(err.message);

  if (match) {
    err.message =
      'unparsable content <' + match[1] + '> detected; ' +
      'this may indicate an invalid CMMN 1.1 diagram file' + match[2];
  }

  return err;
}

var DEFAULT_OPTIONS = {
  width: '100%',
  height: '100%',
  position: 'relative'
};


/**
 * Ensure the passed argument is a proper unit (defaulting to px)
 */
function ensureUnit(val) {
  return val + (isNumber(val) ? 'px' : '');
}

/**
 * A viewer for CMMN 1.1 diagrams.
 *
 * Have a look at {@link NavigatedViewer} or {@link Modeler} for bundles that include
 * additional features.
 *
 *
 * ## Extending the Viewer
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
 * var cmmnViewer = new Viewer({ additionalModules: [ extensionModule ] });
 * cmmnViewer.importXML(...);
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
function Viewer(options) {

  options = assign({}, DEFAULT_OPTIONS, options);

  this._moddle = this._createModdle(options);

  this._container = this._createContainer(options);

  /* <project-logo> */

  addProjectLogo(this._container);

  /* </project-logo> */

  this._init(this._container, this._moddle, options);
}

inherits(Viewer, Diagram);

module.exports = Viewer;


/**
 * Parse and render a CMMN 1.1 diagram.
 *
 * Once finished the viewer reports back the result to the
 * provided callback function with (err, warnings).
 *
 * ## Life-Cycle Events
 *
 * During import the viewer will fire life-cycle events:
 *
 *   * import.parse.start (about to read model from xml)
 *   * import.parse.complete (model read; may have worked or not)
 *   * import.render.start (graphical import start)
 *   * import.render.complete (graphical import finished)
 *   * import.done (everything done)
 *
 * You can use these events to hook into the life-cycle.
 *
 * @param {String} xml the CMMN 1.1 xml
 * @param {Function} [done] invoked with (err, warnings=[])
 */
Viewer.prototype.importXML = function(xml, done) {

  // done is optional
  done = done || function() {};

  var self = this;

  // hook in pre-parse listeners +
  // allow xml manipulation
  xml = this._emit('import.parse.start', { xml: xml }) || xml;

  this._moddle.fromXML(xml, 'cmmn:Definitions', function(err, definitions, context) {

    // hook in post parse listeners +
    // allow definitions manipulation
    definitions = self._emit('import.parse.complete', {
      error: err,
      definitions: definitions,
      context: context
    }) || definitions;

    var parseWarnings = context.warnings;

    if (err) {
      err = checkValidationError(err);

      self._emit('import.done', { error: err, warnings: parseWarnings });

      return done(err, parseWarnings);
    }

    self.importDefinitions(definitions, function(err, importWarnings) {
      var allWarnings = [].concat(parseWarnings, importWarnings || []);

      self._emit('import.done', { error: err, warnings: allWarnings });

      done(err, allWarnings);
    });
  });
};

/**
 * Export the currently displayed CMMN 1.1 diagram as
 * a CMMN 1.1 XML document.
 *
 * ## Life-Cycle Events
 *
 * During XML saving the viewer will fire life-cycle events:
 *
 *   * saveXML.start (before serialization)
 *   * saveXML.serialized (after xml generation)
 *   * saveXML.done (everything done)
 *
 * You can use these events to hook into the life-cycle.
 *
 * @param {Object} [options] export options
 * @param {Boolean} [options.format=false] output formated XML
 * @param {Boolean} [options.preamble=true] output preamble
 *
 * @param {Function} done invoked with (err, xml)
 */
Viewer.prototype.saveXML = function(options, done) {

  if (!done) {
    done = options;
    options = {};
  }

  var self = this;

  var definitions = this._definitions;

  if (!definitions) {
    return done(new Error('no definitions loaded'));
  }

  // allow to fiddle around with definitions
  definitions = this._emit('saveXML.start', {
    definitions: definitions
  }) || definitions;

  this._moddle.toXML(definitions, options, function(err, xml) {

    try {
      xml = self._emit('saveXML.serialized', {
        error: err,
        xml: xml
      }) || xml;

      self._emit('saveXML.done', {
        error: err,
        xml: xml
      });
    } catch (e) {
      console.error('error in saveXML life-cycle listener', e);
    }

    done(err, xml);
  });
};

Viewer.prototype.saveSVG = function(options, done) {

  if (!done) {
    done = options;
    options = {};
  }

  var canvas = this.get('canvas');

  var contentNode = canvas.getDefaultLayer(),
      defsNode = domQuery('defs', canvas._svg);

  var contents = innerSVG(contentNode),
      defs = (defsNode && defsNode.outerHTML) || '';

  var bbox = contentNode.getBBox();

  var svg =
    '<?xml version="1.0" encoding="utf-8"?>\n' +
    '<!-- created with cmmn-js / http://bpmn.io -->\n' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
         'width="' + bbox.width + '" height="' + bbox.height + '" ' +
         'viewBox="' + bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height + '" version="1.1">' +
      defs + contents +
    '</svg>';

  done(null, svg);
};

Viewer.prototype.importDefinitions = function(definitions, done) {

  // use try/catch to not swallow synchronous exceptions
  // that may be raised during model parsing
  try {

    if (this._definitions) {
      // clear existing rendered diagram
      this.clear();
    }

    // update definitions
    this._definitions = definitions;

    // perform graphical import
    Importer.importCmmnDiagram(this, definitions, done);
  } catch (e) {

    // handle synchronous errors
    done(e);
  }
};

Viewer.prototype.attachTo = function(parentNode) {

  if (!parentNode) {
    throw new Error('parentNode required');
  }

  // ensure we detach from the
  // previous, old parent
  this.detach();

  // unwrap jQuery if provided
  if (parentNode.get && parentNode.constructor.prototype.jquery) {
    parentNode = parentNode.get(0);
  }

  if (typeof parentNode === 'string') {
    parentNode = domQuery(parentNode);
  }

  parentNode.appendChild(this._container);

  this._emit('attach', {});

  this.get('canvas').resized();
};

Viewer.prototype.getDefinitions = function() {
  return this._definitions;
};

Viewer.prototype.detach = function() {

  var container = this._container,
      parentNode = container.parentNode;

  if (!parentNode) {
    return;
  }

  this._emit('detach', {});

  parentNode.removeChild(container);
};

Viewer.prototype.getModules = function() {
  return this._modules;
};

/**
 * Destroy the viewer instance and remove all its
 * remainders from the document tree.
 */
Viewer.prototype.destroy = function() {

  // diagram destroy
  Diagram.prototype.destroy.call(this);

  // dom detach
  domRemove(this._container);
};

/**
 * Register an event listener
 *
 * Remove a previously added listener via {@link #off(event, callback)}.
 *
 * @param {String} event
 * @param {Number} [priority]
 * @param {Function} callback
 * @param {Object} [that]
 */
Viewer.prototype.on = function(event, priority, callback, target) {
  return this.get('eventBus').on(event, priority, callback, target);
};

/**
 * De-register an event listener
 *
 * @param {String} event
 * @param {Function} callback
 */
Viewer.prototype.off = function(event, callback) {
  this.get('eventBus').off(event, callback);
};


Viewer.prototype._init = function(container, moddle, options) {

  var baseModules = options.modules || this.getModules(),
      additionalModules = options.additionalModules || [],
      staticModules = [
        {
          cmmnjs: [ 'value', this ],
          moddle: [ 'value', moddle ]
        }
      ];

  var diagramModules = [].concat(staticModules, baseModules, additionalModules);

  var diagramOptions = assign(omit(options, 'additionalModules'), {
    canvas: assign({}, options.canvas, { container: container }),
    modules: diagramModules
  });

  // invoke diagram constructor
  Diagram.call(this, diagramOptions);

  if (options && options.container) {
    this.attachTo(options.container);
  }
};

/**
 * Emit an event on the underlying {@link EventBus}
 *
 * @param  {String} type
 * @param  {Object} event
 *
 * @return {Object} event processing result (if any)
 */
Viewer.prototype._emit = function(type, event) {
  return this.get('eventBus').fire(type, event);
};

Viewer.prototype._createContainer = function(options) {

  var container = domify('<div class="cjs-container"></div>');

  assign(container.style, {
    width: ensureUnit(options.width),
    height: ensureUnit(options.height),
    position: options.position
  });

  return container;
};

Viewer.prototype._createModdle = function(options) {
  var moddleOptions = assign({}, this._moddleExtensions, options.moddleExtensions);

  return new CmmnModdle(moddleOptions);
};


// modules the viewer is composed of
Viewer.prototype._modules = [
  require('./core'),
  require('diagram-js/lib/features/selection').default,
  require('diagram-js/lib/features/overlays').default
];


/* <project-logo> */

var PoweredBy = require('./util/PoweredByUtil'),
    domEvent = require('min-dom').event;

/**
 * Adds the project logo to the diagram container as
 * required by the bpmn.io license.
 *
 * @see http://bpmn.io/license
 *
 * @param {Element} container
 */
function addProjectLogo(container) {

  var linkMarkup =
    '<a href="http://bpmn.io" ' +
       'target="_blank" ' +
       'class="bjs-powered-by" ' +
       'title="Powered by bpmn.io" ' +
       'style="position: absolute; bottom: 15px; right: 15px; z-index: 100; ' + PoweredBy.LINK_STYLES + '">' +
      PoweredBy.BPMNIO_IMG +
    '</a>';

  var linkElement = domify(linkMarkup);

  container.appendChild(linkElement);

  domEvent.bind(linkElement, 'click', function(event) {
    PoweredBy.open();

    event.preventDefault();
  });
}

/* </project-logo> */
