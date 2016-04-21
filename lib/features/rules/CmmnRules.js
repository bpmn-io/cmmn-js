'use strict';

var inherits = require('inherits');

var any = require('lodash/collection/any');

var ModelUtil = require('../../util/ModelUtil'),
    is = ModelUtil.is,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    getDefinition = ModelUtil.getDefinition,
    getBusinessObject = ModelUtil.getBusinessObject;

var isCollapsed = require('../../util/DiUtil').isCollapsed;

var ModelingUtil = require('../modeling/util/ModelingUtil'),
    isSame = ModelingUtil.isSame,
    getParent = ModelingUtil.getParent;

var PlanItemDefinitionUtil = require('../modeling/util/PlanItemDefinitionUtil'),
    isDiscretionaryToHumanTask = PlanItemDefinitionUtil.isDiscretionaryToHumanTask,
    isHumanTask = PlanItemDefinitionUtil.isHumanTask,
    isDiscretionaryItem = PlanItemDefinitionUtil.isDiscretionaryItem;

var isDiscretionaryConnection = require('../modeling/util/ConnectionUtil').isDiscretionaryConnection;

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

  this.addRule('connection.create', function(context) {
    var source = context.source,
        target = context.target;

    return self.canConnect(source, target);
  });

  this.addRule('connection.reconnectStart', function(context) {

    var connection = context.connection,
        source = context.hover || context.source,
        target = connection.target;

    return self.canConnect(source, target, connection);
  });

  this.addRule('connection.reconnectEnd', function(context) {

    var connection = context.connection,
        source = connection.source,
        target = context.hover || context.target;

    return self.canConnect(source, target, connection);
  });

  this.addRule('shape.create', function(context) {

    var target = context.target,
        shape = context.shape;

    return self.canDrop(shape, target);
  });

  this.addRule('shape.resize', function(context) {

    var shape = context.shape,
        newBounds = context.newBounds;

    return self.canResize(shape, newBounds);
  });

  this.addRule('elements.move', function(context) {
    return false;
    // var target = context.target,
    //     shapes = context.shapes,
    //     position = context.position;

    // return self.canMove(shapes, target, position);
  });

};

CmmnRules.prototype.canMove = function(elements, target) {

  var self = this;

  // allow default move check to start move operation
  if (!target) {
    return true;
  }

  return elements.every(function(element) {
    return self.canDrop(element, target);
  });

};


CmmnRules.prototype.canDrop = function(element, target) {

  if (isCasePlanModel(element)) {
    // allow casePlanModels to drop only on root (CMMNDiagram)
    return is(target, 'cmmndi:CMMNDiagram');
  }

    // allow any other element to drop on a case plan model or on an expanded stage
  if (!isPlanFragment(target)) {
    return false;
  }

  return !isCollapsed(target);

};


CmmnRules.prototype.canResize = function(shape, newBounds) {
  if (isPlanFragment(shape)) {
    return (!isCollapsed(shape)) && (
          !newBounds || (newBounds.width >= 100 && newBounds.height >= 80)
    );
  }

  return false;
};

CmmnRules.prototype.canConnect = function(source, target, connection) {

  if (nonExistantOrLabel(source) || nonExistantOrLabel(target)) {
    return null;
  }

  // Disallow connections with same target and source element.
  if (isSame(source, target)) {
    return false;
  }

  if (this.canConnectDiscretionaryConnection(source, target, connection)) {
    return {
      type: 'cmmndi:CMMNEdge'
    };
  }

  return false;
};


CmmnRules.prototype.canConnectDiscretionaryConnection = function(source, target, connection) {

  if (!isHumanTask(getDefinition(source))) {
    return false;
  }

  if (!isDiscretionaryItem(target)) {
    return false;
  }

  // A HumanTask MUST NOT be discretionary to itself.
  var sourceDefinition = getDefinition(source);
  var targetDefinition = getDefinition(target);

  if (isSame(sourceDefinition, targetDefinition)) {
    return false;
  }

  var sourceParent = getParent(source);
  var targetParent = getParent(target);

  if (!isSame(sourceParent, targetParent)) {
    return false;
  }

  // if the target discretionary item is already
  // part of a human task, then it should not be
  // possible to create a connection to it in some
  // cases.
  if (isDiscretionaryToHumanTask(target)) {

    if (!isUniqueDiscretionaryConnection(source, target, connection)) {
      return false;
    }

    var parent = getParent(getBusinessObject(target), 'cmmn:HumanTask');

    if (!isSame(getDefinition(source), parent)) {
      if (hasIncomingDiscretionaryConnections(target, connection)) {
        return false;
      }
    }

  }

  return true;
};


/**
 * Utility functions for rule checking
 */

function nonExistantOrLabel(element) {
  return !element || isLabel(element);
}

function isLabel(element) {
  return element.labelTarget;
}

function isUniqueDiscretionaryConnection(source, target, connection) {
  return !any(target.incoming, function(con) {
    return con !== connection &&
        isDiscretionaryConnection(con) &&
        con.source === source &&
        con.target === target;
  });
}

function hasIncomingDiscretionaryConnections(target, connection) {
  return any(target.incoming, function(con) {
    return con !== connection && isDiscretionaryConnection(con);
  });
}

function isPlanFragment(element) {
  return !!(isCasePlanModel(element) || is(getDefinition(element), 'cmmn:PlanFragment'));
}
