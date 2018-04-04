'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor').default;

var ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    isCasePlanModel = ModelUtil.isCasePlanModel;

/*
 * If a criterion is (re-)attached to a case plan model,
 * then the (visual) parent must be the case plan model itself,
 * and not the root element.
 */
function AttachCriterionBehavior(eventBus) {

  CommandInterceptor.call(this, eventBus);

  this.preExecute([ 'shape.create', 'elements.move' ], function(context) {

    var shape = context.shape,
        shapes = context.shapes,
        parent = context.parent || context.newParent,
        host = context.host || context.newHost;

    if (!parent) {
      return;
    }

    if (!host || !isCasePlanModel(host)) {
      return;
    }

    if (shapes && shapes.length > 1) {
      return;
    }

    shape = shape || shapes[0];

    if (!is(shape, 'cmmn:Criterion')) {
      return;
    }

    context.parent = context.parent && host;
    context.newParent = context.newParent && host;

  }, true);



}

AttachCriterionBehavior.$inject = [ 'eventBus' ];

inherits(AttachCriterionBehavior, CommandInterceptor);

module.exports = AttachCriterionBehavior;
