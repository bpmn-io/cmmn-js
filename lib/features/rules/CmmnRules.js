'use strict';

var inherits = require('inherits');

var any = require('lodash/collection/any');
var forEach = require('lodash/collection/forEach');

var ModelUtil = require('../../util/ModelUtil'),
    is = ModelUtil.is,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    getDefinition = ModelUtil.getDefinition,
    getBusinessObject = ModelUtil.getBusinessObject;

var isCollapsed = require('../../util/DiUtil').isCollapsed;

var getParents = require('../modeling/util/ModelingUtil').getParents;

var ModelingUtil = require('../modeling/util/ModelingUtil'),
    isSame = ModelingUtil.isSame,
    isSameCase = ModelingUtil.isSameCase,
    getParent = ModelingUtil.getParent;

var PlanItemDefinitionUtil = require('../modeling/util/PlanItemDefinitionUtil'),
    isDiscretionaryToHumanTask = PlanItemDefinitionUtil.isDiscretionaryToHumanTask,
    isHumanTask = PlanItemDefinitionUtil.isHumanTask,
    isDiscretionaryItem = PlanItemDefinitionUtil.isDiscretionaryItem;

var isCriterionAttachment = require('../snapping/CmmnSnappingUtil').getCriterionAttachment;

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
        shape = context.shape,
        source = context.source,
        position = context.position;

    return self.canAttach([ shape ], target, source, position) ||
           self.canDrop(shape, target);

  });

  this.addRule('shape.resize', function(context) {

    var shape = context.shape,
        newBounds = context.newBounds;

    return self.canResize(shape, newBounds);
  });

  this.addRule('elements.move', function(context) {
    var target = context.target,
        shapes = context.shapes,
        position = context.position;

    return self.canAttach(shapes, target, null, position) ||
           self.canReplace(shapes, target, position) ||
           self.canMove(shapes, target, position);
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

  if (isTextAnnotation(element)) {

    return is(target, 'cmmndi:CMMNDiagram') ||
           isPlanFragment(target, true);
  }

  if (isCriterion(element)) {
    return false;
  }

  if (isCasePlanModel(element)) {
    // allow casePlanModels to drop only on root (CMMNDiagram)
    return is(target, 'cmmndi:CMMNDiagram');
  }

    // allow any other element to drop on a case plan model or on an expanded stage
  if (!isPlanFragment(target, true)) {
    return false;
  }

  return !isCollapsed(target);

};


CmmnRules.prototype.canResize = function(shape, newBounds) {
  if (isPlanFragment(shape, true)) {
    return (!isCollapsed(shape)) && (
          !newBounds || (newBounds.width >= 100 && newBounds.height >= 80)
    );
  }

  if (isTextAnnotation(shape)) {
    return true;
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

  if (this.canConnectPlanItemOnPartConnection(source, target)) {
    return {
      type: 'cmmn:PlanItemOnPart',
      isStandardEventVisible: true
    };
  }

  if (this.canConnectCaseFileItemOnPartConnection(source, target)) {
    return {
      type: 'cmmn:CaseFileItemOnPart',
      isStandardEventVisible: true
    };
  }

  if (this.canConnectDiscretionaryConnection(source, target, connection)) {
    return {
      type: 'cmmndi:CMMNEdge'
    };
  }

  if (is(connection, 'cmmn:Association') && this.canConnectAssociation(source, target)) {

    return {
      type: 'cmmn:Association'
    };
  }

  if (isTextAnnotation(source) || isTextAnnotation(target)) {

    return {
      type: 'cmmn:Association'
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


CmmnRules.prototype.canConnectPlanItemOnPartConnection = function(source, target) {

  if (!isSameCase(source, target)) {
    return false;
  }

  if (isExitCriterion(source)) {
    source = source.host;
  }

  return is(source, 'cmmn:PlanItem') && isCriterion(target);
};


CmmnRules.prototype.canConnectCaseFileItemOnPartConnection = function(source, target) {
  return !!(isSameCase(source, target) &&
            isCaseFileItem(source) &&
            isCriterion(target));
};

CmmnRules.prototype.canConnectAssociation = function(source, target) {

  // do not connect connections
  if (isConnection(source) || isConnection(target)) {
    return false;
  }

  // connect if different parent
  return !isParent(target, source) &&
         !isParent(source, target);

};

CmmnRules.prototype.canAttach = function(elements, target, source, position) {

  if (!Array.isArray(elements)) {
    elements = [ elements ];
  }

  if (source) {
    return false;
  }

  // only (re-)attach one element at a time
  if (elements.length !== 1) {
    return false;
  }

  var element = elements[0];

  // do not attach labels
  if (isLabel(element)) {
    return false;
  }

  // only handle entry/exit criterion
  if (!isCriterion(element)) {
    return false;
  }

  // allow default move operation
  if (!target) {
    return true;
  }

  // disallow drop criterion on another criterion
  if (isCriterion(target)) {
    return false;
  }

  if (isEventListener(target)) {
    return false;
  }

  // a plan fragment does not have any execution semantic,
  // that why it should not be possible to attach an criterion
  if (isPlanFragment(target)) {
    return false;
  }

  // only attach to border
  if (position && !isCriterionAttachment(position, target)) {
    return false;
  }

  return 'attach';
};


CmmnRules.prototype.canAttachEntryCriterion = function(target, position) {
  // disallow drop entry criterion...

  // ... on case plan model
  if (isCasePlanModel(target)) {
    return false;
  }

  // ... on event listener
  if (isEventListener(target)) {
    return false;
  }

  // ... plan fragment
  if (isPlanFragment(target)) {
    return false;
  }

  // only attach to border
  if (position && !isCriterionAttachment(position, target)) {
    return false;
  }

  return true;

};


CmmnRules.prototype.canAttachExitCriterion = function(target, position) {
  // disallow drop exit criterion...

  // ... on event listener
  if (isEventListener(target)) {
    return false;
  }

  // ... on milestone
  if (isMilestone(target)) {
    return false;
  }

  // ... on non blocking task
  if (isTask(target) && !getDefinition(target).isBlocking) {
    return false;
  }

  // ... plan fragment
  if (isPlanFragment(target)) {
    return false;
  }

  // only attach to border
  if (position && !isCriterionAttachment(position, target)) {
    return false;
  }

  return true;

};


CmmnRules.prototype.canReplace = function(elements, target, position) {

  if (!target) {
    return false;
  }

  var canExecute = {
    replacements: []
  };

  var self = this;

  forEach(elements, function(element) {

    if (isEntryCriterion(element) && !self.canAttachEntryCriterion(target, position)) {
      if (self.canAttachExitCriterion(target, position)) {
        canExecute.replacements.push({
          oldElementId: element.id,
          newElementType: 'cmmn:ExitCriterion'
        });
      }
    }

    if (isExitCriterion(element) && !self.canAttachExitCriterion(target, position)) {
      if (self.canAttachEntryCriterion(target, position)) {
        canExecute.replacements.push({
          oldElementId: element.id,
          newElementType: 'cmmn:EntryCriterion'
        });
      }
    }

  });

  return canExecute.replacements.length ? canExecute : false;
};


CmmnRules.prototype.canSetRepetitionRule = function(element) {

  element = getDefinition(element) || element;
  return canSetDefaultControls(element);

};


CmmnRules.prototype.canSetRequiredRule = function(element) {

  element = getDefinition(element) || element;
  return canSetDefaultControls(element);

};


CmmnRules.prototype.canSetManualActivationRuleRule = function(element) {

  element = getDefinition(element) || element;

  if (canSetDefaultControls(element)) {

    if (isMilestone(element)) {
      return false;
    }

  }

  return true;

};


/**
 * Utility functions for rule checking
 */

function isParent(possibleParent, element) {
  var allParents = getParents(element);
  return allParents.indexOf(possibleParent) !== -1;
}

function canSetDefaultControls(definition) {
  return !is(definition, 'cmmn:EventListener');
}

function nonExistantOrLabel(element) {
  return !element || isLabel(element);
}

function isLabel(element) {
  return element.labelTarget;
}

function isConnection(element) {
  return element.waypoints;
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

function isDiscretionaryConnection(connection) {
  return !connection.businessObject.cmmnElementRef;
}

function isPlanFragment(element, isStage) {
  var definition = getDefinition(element) || element;

  if (!is(definition, 'cmmn:PlanFragment')) {
    return false;
  }

  if (!isStage && is(definition, 'cmmn:Stage')) {
    return false;
  }

  return true;
}

function isEventListener(element) {
  return is(getDefinition(element), 'cmmn:EventListener');
}

function isMilestone(element) {
  return is(getDefinition(element), 'cmmn:Milestone');
}

function isTask(element) {
  return is(getDefinition(element), 'cmmn:Task');
}

function isCriterion(element) {
  return is(element, 'cmmn:Criterion');
}

function isEntryCriterion(element) {
  return is(element, 'cmmn:EntryCriterion');
}

function isExitCriterion(element) {
  return is(element, 'cmmn:ExitCriterion');
}

function isTextAnnotation(element) {
  return is(element, 'cmmn:TextAnnotation');
}

function isCaseFileItem(element) {
  return is(element, 'cmmn:CaseFileItem');
}