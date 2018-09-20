'use strict';

var inherits = require('inherits'),
    isArray = require('min-dash').isArray,
    isObject = require('min-dash').isObject,
    assign = require('min-dash').assign;

var BaseRenderer = require('diagram-js/lib/draw/BaseRenderer').default,
    TextUtil = require('diagram-js/lib/util/Text').default,
    DiUtil = require('../util/DiUtil'),
    ModelUtil = require('../util/ModelUtil');

var isStandardEventVisible = DiUtil.isStandardEventVisible;
var isPlanningTableCollapsed = DiUtil.isPlanningTableCollapsed;
var isCollapsed = DiUtil.isCollapsed;

var isCasePlanModel = ModelUtil.isCasePlanModel;
var getBusinessObject = ModelUtil.getBusinessObject;
var getDefinition = ModelUtil.getDefinition;
var isRequired = ModelUtil.isRequired;
var isRepeatable = ModelUtil.isRepeatable;
var isManualActivation = ModelUtil.isManualActivation;
var isAutoComplete = ModelUtil.isAutoComplete;
var hasPlanningTable = ModelUtil.hasPlanningTable;
var getName = ModelUtil.getName;
var is = ModelUtil.is;
var getStandardEvent = ModelUtil.getStandardEvent;

var domQuery = require('min-dom').query;

var svgAppend = require('tiny-svg').append,
    svgAttr = require('tiny-svg').attr,
    svgClasses = require('tiny-svg').classes,
    svgCreate = require('tiny-svg').create;

var translate = require('diagram-js/lib/util/SvgTransformUtil').translate;

var createLine = require('diagram-js/lib/util/RenderUtil').createLine;


function CmmnRenderer(eventBus, styles, pathMap) {

  BaseRenderer.call(this, eventBus);

  var TASK_BORDER_RADIUS = 10;
  var MILESTONE_BORDER_RADIUS = 24;
  var STAGE_EDGE_OFFSET = 20;

  var LABEL_STYLE = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px'
  };

  var textUtil = new TextUtil({
    style: LABEL_STYLE,
    size: { width: 100 }
  });

  var markers = {};

  function addMarker(id, element) {
    markers[id] = element;
  }

  function marker(id) {
    return markers[id];
  }

  function initMarkers(svg) {

    function createMarker(id, options) {
      var attrs = assign({
        fill: 'black',
        strokeWidth: 1,
        strokeLinecap: 'round',
        strokeDasharray: 'none'
      }, options.attrs);

      var ref = options.ref || { x: 0, y: 0 };

      var scale = options.scale || 1;

      // fix for safari / chrome / firefox bug not correctly
      // resetting stroke dash array
      if (attrs.strokeDasharray === 'none') {
        attrs.strokeDasharray = [10000, 1];
      }

      var marker = svgCreate('marker');

      svgAttr(options.element, attrs);

      svgAppend(marker, options.element);

      svgAttr(marker, {
        id: id,
        viewBox: '0 0 20 20',
        refX: ref.x,
        refY: ref.y,
        markerWidth: 20 * scale,
        markerHeight: 20 * scale,
        orient: 'auto'
      });

      var defs = domQuery('defs', svg);

      if (!defs) {
        defs = svgCreate('defs');

        svgAppend(svg, defs);
      }

      svgAppend(defs, marker);

      return addMarker(id, marker);
    }

    var associationStart = svgCreate('path');
    svgAttr(associationStart, { d: 'M 11 5 L 1 10 L 11 15' });

    createMarker('association-start', {
      element: associationStart,
      attrs: {
        fill: 'none',
        stroke: 'black',
        strokeWidth: 1.5
      },
      ref: { x: 1, y: 10 },
      scale: 0.5
    });

    var associationEnd = svgCreate('path');
    svgAttr(associationEnd, { d: 'M 1 5 L 11 10 L 1 15' });

    createMarker('association-end', {
      element: associationEnd,
      attrs: {
        fill: 'none',
        stroke: 'black',
        strokeWidth: 1.5
      },
      ref: { x: 12, y: 10 },
      scale: 0.5
    });

  }

  // draw shape //////////////////////////////////////////////////////////////

  function computeStyle(custom, traits, defaultStyles) {
    if (!isArray(traits)) {
      defaultStyles = traits;
      traits = [];
    }

    return styles.style(traits || [], assign(defaultStyles, custom || {}));
  }

  function drawCircle(parentGfx, width, height, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    var cx = width / 2,
        cy = height / 2;

    var circle = svgCreate('circle');
    svgAttr(circle, {
      cx: cx,
      cy: cy,
      r: Math.round((width + height) / 4 - offset)
    });
    svgAttr(circle, attrs);

    svgAppend(parentGfx, circle);

    return circle;
  }

  function drawRect(parentGfx, width, height, r, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    var rect = svgCreate('rect');
    svgAttr(rect, {
      x: offset,
      y: offset,
      width: width - offset * 2,
      height: height - offset * 2,
      rx: r,
      ry: r
    });
    svgAttr(rect, attrs);

    svgAppend(parentGfx, rect);

    return rect;
  }

  function drawDiamond(parentGfx, width, height, attrs) {

    var x_2 = width / 2;
    var y_2 = height / 2;

    var points = [
      { x: x_2, y: 0 },
      { x: width, y: y_2 },
      { x: x_2, y: height },
      { x: 0, y: y_2 }
    ];

    var pointsString = points.map(function(point) {
      return point.x + ',' + point.y;
    }).join(' ');

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    var polygon = svgCreate('polygon');
    svgAttr(polygon, {
      points: pointsString
    });
    svgAttr(polygon, attrs);

    svgAppend(parentGfx, polygon);

    return polygon;
  }

  function drawPath(parentGfx, d, attrs) {

    attrs = computeStyle(attrs, [ 'no-fill' ], {
      strokeWidth: 2,
      stroke: 'black'
    });

    var path = svgCreate('path');
    svgAttr(path, { d: d });
    svgAttr(path, attrs);

    svgAppend(parentGfx, path);

    return path;
  }

  function drawOctagon(parentGfx, width, height, offset, attrs) {
    offset = offset || 20;

    var x1 = offset;
    var y1 = height;

    var x2 = 0;
    var y2 = height - offset;

    var x3 = 0;
    var y3 = offset;

    var x4 = offset;
    var y4 = 0;

    var x5 = width - offset;
    var y5 = 0;

    var x6 = width;
    var y6 = offset;

    var x7 = width;
    var y7 = height - offset;

    var x8 = width - offset;
    var y8 = height;

    var points = [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
      { x: x3, y: y3 },
      { x: x4, y: y4 },
      { x: x5, y: y5 },
      { x: x6, y: y6 },
      { x: x7, y: y7 },
      { x: x8, y: y8 }
    ];

    attrs = attrs || {};
    attrs.fill = 'white';
    attrs.stroke = 'black';
    attrs.strokeWidth = 2;

    return drawPolygon(parentGfx, points, attrs);
  }

  function drawPolygon(parentGfx, points, attrs) {
    var pointsString = points.map(function(point) {
      return point.x + ',' + point.y;
    }).join(' ');

    var polygon = svgCreate('polygon');

    svgAttr(polygon, {
      points: pointsString
    });
    svgAttr(polygon, attrs);

    svgAppend(parentGfx, polygon);

    return polygon;
  }

  // draw connection ////////////////////////////////////////////

  function drawLine(parentGfx, waypoints, attrs) {
    attrs = computeStyle(attrs, [ 'no-fill' ], {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'none'
    });

    var line = createLine(waypoints, attrs);

    svgAppend(parentGfx, line);

    return line;
  }

  function createPathFromConnection(connection) {
    var waypoints = connection.waypoints;

    var pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;
    for (var i = 1; i < waypoints.length; i++) {
      pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
    }
    return pathData;
  }

  // render label //////////////////////////////////////////////

  function renderLabel(parentGfx, label, options) {
    var text = textUtil.createText(label || '', options);
    svgClasses(text).add('djs-label');
    svgAppend(parentGfx, text);

    return text;
  }

  function renderEmbeddedLabel(p, element, align) {
    var name = getName(element);
    return renderLabel(p, name, {
      box: element,
      align: align,
      padding: 5
    });
  }

  function renderExpandedStageLabel(p, element, align) {
    var name = getName(element);
    var textbox = renderLabel(p, name, { box: element, align: align, padding: 5 });

    // reset the position of the text box
    translate(textbox, STAGE_EDGE_OFFSET, 0);

    return textbox;
  }

  function renderCasePlanModelLabel(p, element) {
    var bo = getBusinessObject(element);

    // default maximum textbox dimensions
    var height = 18;
    var width = (element.width / 2) - 60;

    var label = bo.name;

    // create text box
    var textBox = renderLabel(p, label, {
      box: { height: height, width: width },
      align: 'left-top'
    });

    var minWidth = 60,
        padding = 40,
        textBoxWidth = textBox.getBBox().width;

    // set polygon width based on actual textbox size
    var polygonWidth = textBoxWidth + padding;

    if (textBoxWidth < minWidth) {
      polygonWidth = minWidth + padding;
    }

    var polygonPoints = [
      { x: 10, y: 0 },
      { x: 20, y: -height },
      { x: polygonWidth, y: -height },
      { x: polygonWidth + 10, y: 0 }
    ];

    // The pointer-events attribute is needed to allow clicks on the polygon
    // which otherwise would be prevented by the parent node ('djs-visual').
    var polygon = drawPolygon(p, polygonPoints, {
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      fillOpacity: 0.95,
      'pointer-events': 'all'
    });

    // make sure the textbox is visually on top of the polygon
    textBox.parentNode.insertBefore(polygon, textBox);

    // reset the position of the text box
    translate(textBox, 25, -height + 5);

    return textBox;
  }

  function renderExternalLabel(parentGfx, element) {
    var name = getName(element),
        hide = false;

    var standardEvent = getStandardEvent(element);

    if (standardEvent) {

      var standardEventVisible = isStandardEventVisible(element);
      standardEvent = '[' + standardEvent + ']';

      if (!name) {
        name = standardEvent;
        element.hidden = hide = !standardEventVisible;
      }
      else {
        if (standardEventVisible) {
          name = name + ' ' + standardEvent;
        }
      }

    }

    var box = {
      width: 90,
      height: 30,
      x: element.width / 2 + element.x,
      y: element.height / 2 + element.y
    };

    element.hidden = element.labelTarget.hidden || hide || !name;

    return renderLabel(parentGfx, name, { box: box, style: { fontSize: '11px' } });
  }

  // render elements //////////////////////////////////////////

  function renderer(type) {
    return handlers[type];
  }

  var handlers = {
    'cmmn:PlanItem': function(p, element) {
      var definition = getDefinition(element);
      return renderer(definition.$type)(p, element);
    },

    'cmmn:DiscretionaryItem': function(p, element) {
      var definition = getDefinition(element);

      var attrs = {
        strokeDasharray: '10, 12'
      };

      if (is(definition, 'cmmn:Task')) {
        assign(attrs, {
          strokeDasharray: '12, 12.4',
          strokeDashoffset: 13.6
        });
      }

      return renderer(definition.$type)(p, element, attrs);
    },

    // STAGE
    'cmmn:Stage': function(p, element, attrs) {

      attrs = assign({ fillOpacity: 0.95 }, attrs);

      var rect;
      if (isCasePlanModel(element)) {
        return handlers['cmmn:CasePlanModel'](p, element);
      }

      rect = drawOctagon(p, element.width, element.height, STAGE_EDGE_OFFSET, attrs);

      if (!isCollapsed(element)) {
        renderExpandedStageLabel(p, element, 'left-top');
      }
      else {
        renderEmbeddedLabel(p, element, 'center-middle');
      }

      attachPlanningTableMarker(p, element);
      attachStageMarkers(p, element);
      return rect;
    },

    // STAGE
    'cmmn:PlanFragment': function(p, element, attrs) {

      var rect = drawRect(p, element.width, element.height, TASK_BORDER_RADIUS, {
        strokeDasharray: '10, 12',
        fillOpacity: 0.95
      });

      renderEmbeddedLabel(p, element, isCollapsed(element) ? 'center-middle' : 'left-top');

      attachStageMarkers(p, element);
      return rect;
    },

    'cmmn:CasePlanModel': function(p, element) {
      var rect = drawRect(p, element.width, element.height, 0, {
        fillOpacity: 0.95
      });
      renderCasePlanModelLabel(p, element);
      attachPlanningTableMarker(p, element);
      attachCasePlanModelMarkers(p, element);
      return rect;
    },

    // MILESTONE
    'cmmn:Milestone': function(p, element, attrs) {
      var rect = drawRect(p, element.width, element.height, MILESTONE_BORDER_RADIUS, attrs);
      renderEmbeddedLabel(p, element, 'center-middle');
      attachTaskMarkers(p, element);
      return rect;
    },

    // EVENT LISTENER
    'cmmn:EventListener': function(p, element, attrs) {
      var outerCircle = drawCircle(p, element.width, element.height, attrs);

      attrs = attrs || {};
      attrs.strokeWidth = 2;

      drawCircle(p, element.width, element.height, 0.1 * element.height, attrs);
      return outerCircle;
    },

    'cmmn:TimerEventListener': function(p, element, attrs) {
      var circle = renderer('cmmn:EventListener')(p, element, attrs);

      var pathData = pathMap.getScaledPath('EVENT_TIMER_WH', {
        xScaleFactor: 0.75,
        yScaleFactor: 0.75,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.5,
          my: 0.5
        }
      });

      drawPath(p, pathData, {
        strokeWidth: 2,
        strokeLinecap: 'square'
      });

      for (var i = 0;i < 12;i++) {

        var linePathData = pathMap.getScaledPath('EVENT_TIMER_LINE', {
          xScaleFactor: 0.75,
          yScaleFactor: 0.75,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.5,
            my: 0.5
          }
        });

        var width = element.width / 2;
        var height = element.height / 2;

        drawPath(p, linePathData, {
          strokeWidth: 1,
          strokeLinecap: 'square',
          transform: 'rotate(' + (i * 30) + ',' + height + ',' + width + ')'
        });
      }


      return circle;
    },

    'cmmn:UserEventListener': function(p, element, attrs) {
      var circle = renderer('cmmn:EventListener')(p, element, attrs);

      // TODO: The user event decorator has to be
      // scaled correctly!
      var x = 20;
      var y = 15;

      var pathData = pathMap.getScaledPath('TASK_TYPE_USER_1', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user path */ drawPath(p, pathData, {
        strokeWidth: 0.5,
        fill: 'none'
      });

      var pathData2 = pathMap.getScaledPath('TASK_TYPE_USER_2', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user2 path */ drawPath(p, pathData2, {
        strokeWidth: 0.5,
        fill: 'none'
      });

      var pathData3 = pathMap.getScaledPath('TASK_TYPE_USER_3', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user3 path */ drawPath(p, pathData3, {
        strokeWidth: 0.5,
        fill: 'black'
      });

      return circle;
    },

    // TASK
    'cmmn:Task': function(p, element, attrs) {
      var rect = drawRect(p, element.width, element.height, TASK_BORDER_RADIUS, attrs);
      renderEmbeddedLabel(p, element, 'center-middle');
      attachTaskMarkers(p, element);
      return rect;
    },

    'cmmn:HumanTask': function(p, element, attrs) {
      var task = renderer('cmmn:Task')(p, element, attrs);

      var bo = element.businessObject;
      var definition = bo.definitionRef;

      if (definition.isBlocking) {
        var x = 15;
        var y = 12;

        var pathData1 = pathMap.getScaledPath('TASK_TYPE_USER_1', {
          abspos: {
            x: x,
            y: y
          }
        });

        /* user path */ drawPath(p, pathData1, {
          strokeWidth: 0.5,
          fill: 'none'
        });

        var pathData2 = pathMap.getScaledPath('TASK_TYPE_USER_2', {
          abspos: {
            x: x,
            y: y
          }
        });

        /* user2 path */ drawPath(p, pathData2, {
          strokeWidth: 0.5,
          fill: 'none'
        });

        var pathData3 = pathMap.getScaledPath('TASK_TYPE_USER_3', {
          abspos: {
            x: x,
            y: y
          }
        });

        /* user3 path */ drawPath(p, pathData3, {
          strokeWidth: 0.5,
          fill: 'black'
        });
      }

      else {
        var pathData = pathMap.getScaledPath('TASK_TYPE_MANUAL', {
          abspos: {
            x: 17,
            y: 15
          }
        });

        /* manual path */ drawPath(p, pathData, {
          strokeWidth: 1.25,
          fill: 'white',
          stroke: 'black'
        });
      }

      attachPlanningTableMarker(p, element);

      return task;
    },

    'cmmn:CaseTask': function(p, element, attrs) {
      var task = renderer('cmmn:Task')(p, element, attrs);

      var pathData = pathMap.getScaledPath('TASK_TYPE_FOLDER', {
        abspos: {
          x: 7,
          y: 7
        }
      });

      /* manual path */ drawPath(p, pathData, {
        strokeWidth: 1.25,
        fill: 'white',
        stroke: 'black'
      });

      return task;
    },

    'cmmn:ProcessTask': function(p, element, attrs) {
      var task = renderer('cmmn:Task')(p, element, attrs);

      var pathData = pathMap.getScaledPath('TASK_TYPE_CHEVRON', {
        abspos: {
          x: 5,
          y: 5
        }
      });

      /* manual path */ drawPath(p, pathData, {
        strokeWidth: 1.25,
        fill: 'white',
        stroke: 'black'
      });

      return task;
    },

    'cmmn:DecisionTask': function(p, element, attrs) {
      var task = renderer('cmmn:Task')(p, element, attrs);

      var headerPathData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_HEADER', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      drawPath(p, headerPathData, {
        strokeWidth: 1,
        fill: '000'
      });

      var headerData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_MAIN', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      drawPath(p, headerData, {
        strokeWidth: 1
      });

      return task;
    },

    'cmmn:CaseFileItem': function(p, element, attrs) {
      var pathData = pathMap.getScaledPath('DATA_OBJECT_PATH', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.474,
          my: 0.296
        }
      });

      return drawPath(p, pathData, { fill: 'white' });
    },

    // ARTIFACTS
    'cmmn:TextAnnotation': function(p, element) {
      var style = {
        'fill': 'none',
        'stroke': 'none'
      };
      var textElement = drawRect(p, element.width, element.height, 0, 0, style);
      var textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.0,
          my: 0.0
        }
      });
      drawPath(p, textPathData);

      var text = getBusinessObject(element).text || '';
      renderLabel(p, text, { box: element, align: 'left-middle', padding: 5 });

      return textElement;
    },

    'cmmn:Association': function(p, element, attrs) {

      var semantic = getBusinessObject(element);

      attrs = assign({
        strokeDasharray: '0.5, 5',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }, attrs || {});

      if (semantic.associationDirection === 'One' ||
          semantic.associationDirection === 'Both') {
        attrs.markerEnd = marker('association-end');
      }

      if (semantic.associationDirection === 'Both') {
        attrs.markerStart = marker('association-start');
      }

      return drawLine(p, element.waypoints, attrs);
    },

    // MARKERS
    'StageMarker': function(p, element) {
      var markerRect = drawRect(p, 14, 14, 0, {
        strokeWidth: 1,
        stroke: 'black'
      });

      translate(markerRect, element.width / 2 - 7, element.height - 17);

      var path = isCollapsed(element) ? 'MARKER_STAGE_COLLAPSED' : 'MARKER_STAGE_EXPANDED';

      var stagePath = pathMap.getScaledPath(path, {
        xScaleFactor: 1.5,
        yScaleFactor: 1.5,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: (element.width / 2 - 7) / element.width,
          my: (element.height - 17) / element.height
        }
      });

      drawPath(p, stagePath);
    },

    'RequiredMarker': function(p, element, position) {
      var path = pathMap.getScaledPath('MARKER_REQUIRED', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position) / element.width),
          my: (element.height - 17) / element.height
        }
      });

      drawPath(p, path, { strokeWidth: 3 });
    },

    'AutoCompleteMarker': function(p, element, position) {
      var markerRect = drawRect(p, 11, 14, 0, {
        strokeWidth: 1,
        stroke: 'black',
        fill: 'black'
      });

      translate(markerRect, element.width / 2 + position + 2, element.height - 17);
    },

    'ManualActivationMarker': function(p, element, position) {
      var path = pathMap.getScaledPath('MARKER_MANUAL_ACTIVATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position) / element.width),
          my: (element.height - 17) / element.height
        }
      });

      drawPath(p, path, { strokeWidth: 1 });
    },

    'RepetitionMarker': function(p, element, position) {
      var path = pathMap.getScaledPath('MARKER_REPEATABLE', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position) / element.width),
          my: (element.height - 17) / element.height
        }
      });

      drawPath(p, path);
    },

    'PlanningTableMarker': function(p, element, position) {
      var planningTableRect = drawRect(p, 30, 24, 0, {
        strokeWidth: 1.5,
        stroke: 'black'
      });

      translate(planningTableRect, element.width / 2 - 15, -17);

      var isCollapsed = isPlanningTableCollapsed(element);

      var marker = isCollapsed ? 'MARKER_PLANNING_TABLE_COLLAPSED' : 'MARKER_PLANNING_TABLE_EXPANDED';

      var stagePath = pathMap.getScaledPath(marker, {
        xScaleFactor: 1.5,
        yScaleFactor: 1.5,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: (element.width / 2 - 15) / element.width,
          my: (-17) / element.height
        }
      });

      drawPath(p, stagePath, {
        strokeWidth: 1.5
      });
    },

    'cmmn:OnPart': function(p, element) {
      var pathData = createPathFromConnection(element);

      var path = drawPath(p, pathData, {
        strokeDasharray: '10, 5, 2, 5, 2, 5',
        strokeWidth: 1.5
      });

      return path;
    },
    'cmmn:PlanItemOnPart': function(p, element) {
      return renderer('cmmn:OnPart')(p, element);
    },
    'cmmn:CaseFileItemOnPart': function(p, element) {
      return renderer('cmmn:OnPart')(p, element);
    },
    'cmmn:EntryCriterion': function(p, element) {
      return drawDiamond(p, element.width, element.height, {
        fill: 'white'
      });
    },
    'cmmn:ExitCriterion': function(p, element) {
      return drawDiamond(p, element.width, element.height, {
        fill: 'black'
      });
    },

    'cmmndi:CMMNEdge': function(p, element) {

      var bo = getBusinessObject(element);

      if (bo.cmmnElementRef) {
        return renderer(bo.cmmnElementRef.$type)(p, element);
      }

      var pathData = createPathFromConnection(element);

      var path = drawPath(p, pathData, {
        strokeDasharray: '3, 5',
        strokeWidth: 1
      });

      return path;
    },

    'label': function(parentGfx, element) {
      // Update external label size and bounds during rendering when
      // we have the actual rendered bounds anyway.

      var textElement = renderExternalLabel(parentGfx, element);

      var textBBox;

      try {
        textBBox = textElement.getBBox();
      } catch (e) {
        textBBox = { width: 0, height: 0, x: 0 };
      }

      // update element.x so that the layouted text is still
      // center alligned (newX = oldMidX - newWidth / 2)
      element.x = Math.ceil(element.x + element.width / 2) - Math.ceil((textBBox.width / 2));

      // take element width, height from actual bounds
      element.width = Math.ceil(textBBox.width);
      element.height = Math.ceil(textBBox.height);

      // compensate bounding box x
      svgAttr(textElement, {
        transform: 'translate(' + (-1 * textBBox.x) + ',0)'
      });

      return textElement;
    }
  };

  // attach markers /////////////////////////

  function attachTaskMarkers(p, element) {
    var obj = getBusinessObject(element);
    var padding = 6;

    var markers = [];

    if (isRequired(obj)) {
      markers.push({ marker: 'RequiredMarker', width: 1 });
    }

    if (isManualActivation(obj)) {
      markers.push({ marker: 'ManualActivationMarker', width: 14 });
    }

    if (isRepeatable(obj)) {
      markers.push({ marker: 'RepetitionMarker', width: 14 });
    }

    if (markers.length) {

      if (markers.length === 1) {
        // align marker in the middle of the element
        drawMarker(markers[0].marker, p, element, (markers[0].width / 2) * (-1));
      }

      else if (markers.length === 2) {
        /* align marker:
         *
         *      |             |
         *      +-------------+
         *             ^
         *             |
         *         +-+   +-+
         *         |0|   |1| <-- markers
         *         +-+   +-+
         * (leftMarker)  (rightMarker)
         */
        drawMarker(markers[0].marker, p, element, (markers[0].width * (-1)) - (padding /2));
        drawMarker(markers[1].marker, p, element, padding / 2);
      }

      else if (markers.length === 3) {
        /* align marker:
         *
         *      |             |
         *      +-------------+
         *             ^
         *             |
         *      +-+   +-+   +-+
         *      |0|   |1|   |2| <-- markers
         *      +-+   +-+   +-+
         */

        /* 1 */ drawMarker(markers[1].marker, p, element, markers[1].width / 2 * (-1));
        /* 0 */ drawMarker(markers[0].marker, p, element, (markers[1].width / 2 * (-1)) - padding - markers[0].width);
        /* 2 */ drawMarker(markers[2].marker, p, element, (markers[1].width / 2) + padding);
      }
    }
  }

  function attachCasePlanModelMarkers(p, element) {
    var obj = getBusinessObject(element);

    if (isAutoComplete(obj)) {
      drawMarker('AutoCompleteMarker', p, element, -7);
    }
  }

  function attachStageMarkers(p, element, stage) {
    var obj = getBusinessObject(element);
    var padding = 6;

    drawMarker('StageMarker', p, element, -7);

    var leftMarkers = [];

    if (isRequired(obj)) {
      leftMarkers.push({ marker: 'RequiredMarker', width: 1 });
    }

    if (isAutoComplete(obj)) {
      leftMarkers.push({ marker: 'AutoCompleteMarker', width: 14 });
    }

    if (leftMarkers.length) {

      if (leftMarkers.length === 1) {
        drawMarker(leftMarkers[0].marker, p, element, (leftMarkers[0].width * (-1) - 7 - padding));
      }

      else if (leftMarkers.length === 2) {
        drawMarker(
          leftMarkers[0].marker,
          p,
          element,
          ((leftMarkers[1].width * (-1)) - 7 - padding) - (leftMarkers[0].width * (-1)) - padding
        );

        drawMarker(leftMarkers[1].marker, p, element, (leftMarkers[1].width * (-1)) - 7 - padding);
      }

    }

    var rightMarkers = [];

    if (isManualActivation(obj)) {
      rightMarkers.push({ marker: 'ManualActivationMarker', width: 14 });
    }

    if (isRepeatable(obj)) {
      rightMarkers.push({ marker: 'RepetitionMarker', width: 14 });
    }

    if (rightMarkers.length) {

      if (rightMarkers.length === 1) {
        drawMarker(rightMarkers[0].marker, p, element, 7 + padding);
      }

      else if (rightMarkers.length === 2) {
        drawMarker(rightMarkers[0].marker, p, element, 7 + padding);
        drawMarker(rightMarkers[1].marker, p, element, 7 + padding + rightMarkers[0].width + padding);
      }

    }
  }

  function attachPlanningTableMarker(p, element) {
    if (hasPlanningTable(element)) {
      drawMarker('PlanningTableMarker', p, element);
    }
  }

  function drawMarker(marker, parent, element, position) {
    renderer(marker)(parent, element, position);
  }

  // draw shape and connection ////////////////////////////////////

  function drawShape(parent, element) {
    var h = handlers[element.type];

    /* jshint -W040 */
    if (!h) {
      return BaseRenderer.prototype.drawShape.apply(this, [ parent, element ]);
    } else {
      return h(parent, element);
    }
  }

  function drawConnection(parent, element) {
    var type = element.type;
    var h = handlers[type];

    /* jshint -W040 */
    if (!h) {
      return BaseRenderer.prototype.drawConnection.apply(this, [ parent, element ]);
    } else {
      return h(parent, element);
    }
  }

  this.canRender = function(element) {
    return is(element, 'cmmn:CMMNElement') || is(element, 'cmmndi:CMMNEdge');
  };

  this.drawShape = drawShape;
  this.drawConnection = drawConnection;

  // hook onto canvas init event to initialize
  // connection start/end markers on svg
  eventBus.on('canvas.init', function(event) {
    initMarkers(event.svg);
  });

}

inherits(CmmnRenderer, BaseRenderer);

CmmnRenderer.$inject = [ 'eventBus', 'styles', 'pathMap' ];

module.exports = CmmnRenderer;
