'use strict';

var inherits = require('inherits');

var some = require('min-dash').some,
    forEach = require('min-dash').forEach,
    assign = require('min-dash').assign,
    filter = require('min-dash').filter;

var ModelUtil = require('../../util/ModelUtil'),
    is = ModelUtil.is,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    getDefinition = ModelUtil.getDefinition,
    getBusinessObject = ModelUtil.getBusinessObject;

var isCollapsed = require('../../util/DiUtil').isCollapsed;

var ModelingUtil = require('../modeling/util/ModelingUtil'),
    isAny = ModelingUtil.isAny,
    isSame = ModelingUtil.isSame,
    isSameCase = ModelingUtil.isSameCase,
    getParent = ModelingUtil.getParent,
    getParents = ModelingUtil.getParents;

var PlanItemDefinitionUtil = require('../modeling/util/PlanItemDefinitionUtil'),
    isDiscretionaryToHumanTask = PlanItemDefinitionUtil.isDiscretionaryToHumanTask,
    isHumanTask = PlanItemDefinitionUtil.isHumanTask,
    isDiscretionaryItem = PlanItemDefinitionUtil.isDiscretionaryItem;

var isCriterionAttachment = require('../snapping/CmmnSnappingUtil').getCriterionAttachment;

var RuleProvider = require('diagram-js/lib/features/rules/RuleProvider').default;


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

  this.addRule('connection.start', function(context) {
    var source = context.source;

    return canStartConnection(source);
  });

  this.addRule('connection.create', function(context) {

    var source = context.source,
        target = context.target,
        allowed = false,
        hints = context.hints || {},
        targetParent = hints.targetParent,
        targetAttach = hints.targetAttach;

    // don't allow incoming connections on
    // attach from context-pad
    if (targetAttach) {
      return false;
    }

    // temporarily set target parent for scoping
    // checks to work
    if (targetParent) {
      target.parent = targetParent;
    }

    try {
      allowed = self.canConnect(source, target) ||
                self.canReplaceConnectionEnd(source, target, 'target');

      if (!allowed) {

        allowed = self.canConnect(target, source) ||
                     self.canReplaceConnectionEnd(target, source, 'source');

        if (allowed) {
          assign(allowed, {
            reverse: true
          });
        }
      }
    } finally {
      // unset temporary target parent
      if (targetParent) {
        target.parent = null;
      }
    }

    return allowed;
  });

  this.addRule('connection.reconnectStart', function(context) {

    var connection = context.connection,
        hover = context.hover,
        source = hover || context.source,
        target = connection.target,
        allowed = false;

    allowed = self.canConnect(source, target, connection);

    if (!allowed && hover) {

      allowed = self.canReplaceConnectionEnd(hover, target, 'source');

      if (!allowed) {

        allowed = self.canConnect(target, hover, connection) ||
                  self.canReplaceConnectionEnd(target, hover, 'target');

        if (allowed) {
          assign(allowed, {
            reverse: true
          });
        }

      }

    }

    return allowed;

  });

  this.addRule('connection.reconnectEnd', function(context) {

    var connection = context.connection,
        source = connection.source,
        hover = context.hover,
        target = hover || context.target,
        allowed = false;

    allowed = self.canConnect(source, target, connection);

    if (!allowed && hover) {

      allowed = self.canReplaceConnectionEnd(source, hover, 'target');

      if (!allowed) {

        allowed = self.canConnect(hover, source, connection) ||
                  self.canReplaceConnectionEnd(hover, source, 'source');

        if (allowed) {
          assign(allowed, {
            reverse: true
          });
        }

      }

    }

    return allowed;

  });

  this.addRule('connection.updateWaypoints', function(context) {
    var connection = context.connection;

    return {
      type: connection.type,
      businessObject: connection.businessObject
    };
  });

  this.addRule('shape.attach', function(context) {

    return self.canAttach(
      context.shape,
      context.target,
      null,
      context.position
    );
  });

  this.addRule('shape.create', function(context) {

    var target = context.target,
        shape = context.shape,
        source = context.source,
        position = context.position,
        shapes = [ shape ];

    return self.canCreate(shape, target, source, position) ||
           self.canReplace(shapes, target, position, source);
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
           self.canMove(shapes, target, position) ||
           self.canReplace(shapes, target, position);
  });

  this.addRule('shape.replace', function(context) {

    var element = context.element,
        host;

    if (isCriterion(element)) {

      host = element.host;

      if (isCasePlanModel(host)) {
        return false;
      }

      if (isTask(host) && !isBlocking(host)) {
        return false;
      }

      if (isMilestone(host) || isEventListener(host)) {
        return false;
      }

    }

  });

  this.addRule([ 'elements.delete' ], function(context) {
    return self.canRemove(context.elements);
  });

};


CmmnRules.prototype.canRemove = function(elements) {

  // do not allow deletion of labels
  return filter(elements, function(e) {
    return !isLabel(e);
  });

};


CmmnRules.prototype.canMove = function(elements, target) {

  var self = this;

  // allow default move check to start move operation
  if (!target) {
    return true;
  }

  return elements.every(function(element) {

    if (isDiscretionaryItem(element)) {
      if (!self.canMoveDiscretionaryItem(element, elements, target)) {
        return false;
      }
    }

    return self.canDrop(element, target);
  });

};


CmmnRules.prototype.canMoveDiscretionaryItem = function(element, elements, target) {

  return !isPlanFragment(target) || some(element.incoming, function(connection) {
    var source = connection.source;
    if (isDiscretionaryConnection(connection)) {
      return isParent(target, source) || elements.indexOf(source) !== -1;
    }
  });

};

CmmnRules.prototype.canCreate = function(shape, target, source, position) {

  var self = this;

  if (!target) {
    return false;
  }

  if (isLabel(target)) {
    return null;
  }

  if (isSame(source, target)) {
    return false;
  }

  // ensure we do not drop the element
  // into source
  if (source && isParent(source, target)) {
    return false;
  }

  if (isDiscretionaryItem(shape)) {
    if (!self.canCreateDiscretionaryItem(shape, target, source)) {
      return false;
    }
  }

  return self.canDrop(shape, target, position);

};

CmmnRules.prototype.canCreateDiscretionaryItem = function(shape, target, source) {
  return !isPlanFragment(target) || isParent(target, source);
};


CmmnRules.prototype.canDrop = function(element, target) {

  // can move labels everywhere
  if (isLabel(element) && !isConnection(target)) {
    return true;
  }

  if (isArtifact(element)) {

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

  if (nonExistingOrLabel(source) || nonExistingOrLabel(target)) {
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

  if (connection &&
      is(connection.businessObject.cmmnElementRef, 'cmmn:Association') &&
      this.canConnectAssociation(source, target)) {

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

  if (!isBlocking(source)) {
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

  if (isSame(source, target.host)) {
    return false;
  }

  if (isParent(source, target.host)) {
    return false;
  }

  if (isEntryCriterion(target) && isParent(target.host, source)) {
    return false;
  }

  return isPlanItem(source) && isCriterion(target);
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

  if (isSame(source, target)) {
    return false;
  }


  if (!Array.isArray(elements)) {
    elements = [ elements ];
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

  if (!this.canAttachCriterion(element, target, position, source)) {
    return false;
  }

  return 'attach';

};


CmmnRules.prototype.canAttachEntryCriterion = function(element, target, position, source) {

  if (!this.canAttachCriterion(element, target, position, source)) {
    return false;
  }

  if (source && isParent(target, source)) {
    return false;
  }

  // disallow drop entry criterion...

  // ... on case plan model
  if (isCasePlanModel(target)) {
    return false;
  }

  if (isPlanFragment(target, true)) {

    // ... when element has an incoming connection which source
    // is a child of the target
    return !some(element.incoming, function(connection) {
      if (is(connection.businessObject.cmmnElementRef, 'cmmn:PlanItemOnPart')) {
        return isParent(target, connection.source);
      }
    });

  }

  return true;
};


CmmnRules.prototype.canAttachExitCriterion = function(element, target, position, source) {

  if (!this.canAttachCriterion(element, target, position, source)) {
    return false;
  }

  // disallow drop exit criterion...

  // ... on milestone
  if (isMilestone(target)) {
    return false;
  }

  // ... on non blocking task
  if (isTask(target) && !isBlocking(target)) {
    return false;
  }

  return true;

};


CmmnRules.prototype.canAttachCriterion = function(element, target, position, source) {

  if (source && isParent(source, target)) {
    return false;
  }

  // disallow drop criterion...

  // ... on another criterion
  if (isCriterion(target)) {
    return false;
  }

  // ... on event listener
  if (isEventListener(target)) {
    return false;
  }

  // a plan fragment does not have any execution semantic,
  // that why it should not be possible to attach an criterion
  if (isPlanFragment(target)) {
    return false;
  }

  // ... on a text annotation
  if (isTextAnnotation(target)) {
    return false;
  }

  // ... on a case file item
  if (isCaseFileItem(target)) {
    return false;
  }

  // only attach to border
  if (position && !isCriterionAttachment(position, target)) {
    return false;
  }

  return true;

};


CmmnRules.prototype.canReplace = function(elements, target, position, source) {

  if (!target) {
    return false;
  }

  if (isSame(source, target)) {
    return false;
  }

  var canExecute = {
    replacements: []
  };

  var self = this;

  forEach(elements, function(element) {

    if (isEntryCriterion(element) && !self.canAttachEntryCriterion(element, target, position, source)) {
      if (self.canAttachExitCriterion(element, target, position, source)) {
        canExecute.replacements.push({
          oldElementId: element.id,
          newElementType: 'cmmn:ExitCriterion'
        });
      }
    }

    if (isExitCriterion(element) && !self.canAttachExitCriterion(element, target, position, source)) {
      if (self.canAttachEntryCriterion(element, target, position, source)) {
        canExecute.replacements.push({
          oldElementId: element.id,
          newElementType: 'cmmn:EntryCriterion'
        });
      }
    }

    if (isPlanFragment(target) &&
        isDiscretionaryItem(element) &&
        self.canDrop(element, target) &&
        !self.canMoveDiscretionaryItem(element, elements, target)) {

      var replacement = {
        oldElementId: element.id,
        newElementType: 'cmmn:PlanItem'
      };

      if (isPlanFragment(element)) {
        assign(replacement, {
          newDefinitionType: 'cmmn:Stage'
        });
      }

      canExecute.replacements.push(replacement);

    }

  });

  return canExecute.replacements.length ? canExecute : false;
};


CmmnRules.prototype.canReplaceConnectionEnd = function(source, target, side) {

  if (!source || !target) {
    return false;
  }

  if (isSame(source, target)) {
    return false;
  }

  if (!isSameCase(source, target)) {
    return false;
  }

  return side === 'source' ? this.canReplaceSource(source, target) : this.canReplaceTarget(source, target);

};


CmmnRules.prototype.canReplaceSource = function(source, target) {

  if (isDiscretionaryItem(source) && isCriterion(target)) {

    if (isSame(source, target.host)) {
      return false;
    }

    if (isPlanFragment(source)) {
      return false;
    }

    if (isParent(source, target.host)) {
      return false;
    }

    if (isEntryCriterion(target) && isParent(target.host, source)) {
      return false;
    }

    return {
      type: 'cmmn:PlanItemOnPart',
      isStandardEventVisible: true,
      replacements: [{
        oldElementId: source.id,
        newElementType: 'cmmn:PlanItem'
      }]
    };

  }


  if (isEntryCriterion(source) && isEntryCriterion(target)) {

    if (isSame(source.host, target.host)) {
      return false;
    }

    if (isParent(target.host, source.host) ||
        isParent(source.host, target.host)) {
      return false;
    }

    if (hasIncomingOnPartConnections(source)) {
      return false;
    }

    if (!this.canAttachExitCriterion(source, source.host)) {
      return false;
    }

    return {
      type: 'cmmn:PlanItemOnPart',
      isStandardEventVisible: true,
      replacements: [{
        oldElementId: source.id,
        newElementType: 'cmmn:ExitCriterion'
      }]
    };

  }

  return false;

};


CmmnRules.prototype.canReplaceTarget = function(source, target) {

  if (isHumanTask(getDefinition(source)) && isPlanItem(target)) {

    if (!isBlocking(source)) {
      return false;
    }

    if (isEventListener(target) || isMilestone(target)) {
      return false;
    }

    if (isSameDefinition(source, target)) {
      return false;
    }

    if (!isSameParent(source, target)) {
      return false;
    }

    return {
      type: 'cmmndi:CMMNEdge',
      replacements: [{
        oldElementId: target.id,
        newElementType: 'cmmn:DiscretionaryItem'
      }]
    };

  }

  if ((isPlanItem(source) || isExitCriterion(source)) && isEntryCriterion(target)) {

    if (isSame(source.host || source, target.host)) {
      return false;
    }

    if (!isParent(target.host, source.host || source)) {
      return false;
    }

    if (hasIncomingOnPartConnections(target)) {
      return false;
    }

    if (!this.canAttachExitCriterion(target, target.host)) {
      return false;
    }

    return {
      type: 'cmmn:PlanItemOnPart',
      isStandardEventVisible: true,
      replacements: [{
        oldElementId: target.id,
        newElementType: 'cmmn:ExitCriterion'
      }]
    };

  }

  return false;

};


CmmnRules.prototype.canSetRepetitionRule = function(element) {
  return isPlanItemControlCapable(element);
};


CmmnRules.prototype.canSetRequiredRule = function(element) {
  return isPlanItemControlCapable(element);
};


CmmnRules.prototype.canSetManualActivationRule = function(element) {
  if (isMilestone(element)) {
    return false;
  }
  return isPlanItemControlCapable(element);
};


/**
 * Utility functions for rule checking
 */

/**
 * Checks if given element can be used for starting connection.
 *
 * @param  {Element} source
 * @return {Boolean}
 */
function canStartConnection(element) {
  if (nonExistingOrLabel(element)) {
    return null;
  }

  return isAny(element, [
    'cmmn:CaseFileItem',
    'cmmn:Criterion',
    'cmmn:DiscretionaryItem',
    'cmmn:PlanItem'
  ]);
}

function isParent(possibleParent, element) {
  var allParents = getParents(element);
  return allParents.indexOf(possibleParent) !== -1;
}

function isPlanItemControlCapable(element) {
  return isTask(element) || isMilestone(element) || is(getDefinition(element), 'cmmn:Stage');
}

function nonExistingOrLabel(element) {
  return !element || isLabel(element);
}

function isLabel(element) {
  return element.labelTarget;
}

function isConnection(element) {
  return element.waypoints;
}

function isUniqueDiscretionaryConnection(source, target, connection) {
  return !some(target.incoming, function(con) {
    return con !== connection &&
        isDiscretionaryConnection(con) &&
        con.source === source &&
        con.target === target;
  });
}

function hasIncomingDiscretionaryConnections(target, connection) {
  return some(target.incoming, function(con) {
    return con !== connection && isDiscretionaryConnection(con);
  });
}

function isDiscretionaryConnection(connection) {
  return !connection.businessObject.cmmnElementRef;
}

function hasIncomingOnPartConnections(target) {
  return some(target.incoming, function(con) {
    return isOnPartConnection(con);
  });
}

function isOnPartConnection(connection) {
  return is(connection.businessObject.cmmnElementRef, 'cmmn:OnPart');
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

function isBlocking(element) {
  element = getDefinition(element);
  return !!(element && element.isBlocking);
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

function isArtifact(element) {
  if (isConnection(element)) {
    element = element.businessObject.cmmnElementRef;
  }
  return is(element, 'cmmn:Artifact');
}

function isTextAnnotation(element) {
  return is(element, 'cmmn:TextAnnotation');
}

function isCaseFileItem(element) {
  return is(element, 'cmmn:CaseFileItem');
}

function isPlanItem(element) {
  return is(element, 'cmmn:PlanItem');
}

function isSameParent(a, b) {
  return isSame(getParent(a), getParent(b));
}

function isSameDefinition(a, b) {
  return isSame(getDefinition(a), getDefinition(b));
}
