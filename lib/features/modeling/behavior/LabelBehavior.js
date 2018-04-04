'use strict';

var assign = require('min-dash').assign,
    inherits = require('inherits');

var LabelUtil = require('../../../util/LabelUtil'),
    ModelUtil = require('../../../util/ModelUtil'),
    DiUtil = require('../../../util/DiUtil'),
    ModelingUtil = require('../util/ModelingUtil');

var getBusinessObject = ModelUtil.getBusinessObject,
    getName = ModelUtil.getName;

var hasExternalLabel = LabelUtil.hasExternalLabel,
    getExternalLabelMid = LabelUtil.getExternalLabelMid;

var isStandardEventVisible = DiUtil.isStandardEventVisible;

var isAny = ModelingUtil.isAny;

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor').default;


/**
 * A component that makes sure that external labels are added
 * together with respective elements and properly updated (DI wise)
 * during move.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {cmmnFactory} cmmnFactory
 */
function LabelBehavior(eventBus, modeling, cmmnFactory) {

  CommandInterceptor.call(this, eventBus);

  // create external labels on shape creation

  this.postExecuted([ 'shape.create', 'connection.create' ], 200, function(e) {
    var context = e.context;

    var element = context.shape || context.connection,
        businessObject = element.businessObject;

    var position;

    if (hasExternalLabel(businessObject)) {
      position = getExternalLabelMid(element);

      modeling.createLabel(element, position, {
        id: businessObject.id + '_label',
        hidden: !getName(element) && !isStandardEventVisible(businessObject),
        businessObject: businessObject
      });
    }
  });


  // update label position on waypoints change if still hidden
  this.postExecute([ 'connection.updateWaypoints' ], function(e) {
    var context = e.context,
        connection = context.connection,
        label = connection.label;

    if (!label) {
      return;
    }

    if (label.hidden) {
      var position = getExternalLabelMid(connection);

      var delta = {
        x: position.x - label.x - label.width / 2,
        y: position.y - label.y - label.height / 2
      };

      modeling.moveShape(label, delta);
    }
  });


  this.postExecute([ 'shape.replace' ], function(e) {
    var context = e.context,
        newShape = context.newShape,
        oldShape = context.oldShape;

    var businessObject = getBusinessObject(newShape);

    if (businessObject && hasExternalLabel(businessObject)) {
      newShape.label.x = oldShape.label.x;
      newShape.label.y = oldShape.label.y;
    }
  });


  // update di information on label creation
  this.executed([ 'label.create' ], function(e) {

    var element = e.context.shape,
        businessObject,
        di;

    // we want to trigger on real labels only
    if (!element.labelTarget) {
      return;
    }

    // we want to trigger on CMMN elements only
    if (!isAny(element.labelTarget || element, [ 'cmmn:CMMNElement', 'cmmndi:CMMNDiagramElement' ])) {
      return;
    }

    businessObject = element.businessObject,
    di = businessObject.di || businessObject;


    if (!di.label) {
      di.label = cmmnFactory.createDiLabel();
    }

    if (!di.label.bounds) {
      di.label.bounds = cmmnFactory.createDiBounds();
    }

    assign(di.label.bounds, {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    });
  });

}

inherits(LabelBehavior, CommandInterceptor);

LabelBehavior.$inject = [ 'eventBus', 'modeling', 'cmmnFactory' ];

module.exports = LabelBehavior;
