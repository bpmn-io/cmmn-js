'use strict';

var inherits = require('inherits');

var is = require('../../util/ModelUtil').is,
    isCasePlanModel = require('../../util/ModelUtil').isCasePlanModel,
    getDefinition = require('../../util/ModelUtil').getDefinition;

var RuleProvider = require('diagram-js/lib/features/rules/RuleProvider');

/**
 * CMMN specific modeling rule
 */
function CmmnRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(CmmnRules, RuleProvider);

CmmnRules.$inject = [ 'eventBus' ];

module.exports = CmmnRules;

CmmnRules.prototype.init = function() {

  var self = this;

  this.addRule('shape.create', function(context) {

    var target = context.target,
        shapes = context.shapes;

    return self.canDrop(shapes, target);
  });
};


CmmnRules.prototype.canDrop = function(elements, target) {
  // only allow drop on a case plan model or on a stage
  return !!(isCasePlanModel(target) || is(getDefinition(target), 'cmmn:Stage'));
};

