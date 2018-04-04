'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor').default;

var forEach = require('min-dash').forEach,
    flatten = require('min-dash').flatten,
    groupBy = require('min-dash').groupBy,
    map = require('min-dash').map,
    some = require('min-dash').some;

var ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    getSentry = ModelUtil.getSentry,
    getBusinessObject = ModelUtil.getBusinessObject,
    getDefinition = ModelUtil.getDefinition,
    getStandardEvents = ModelUtil.getStandardEvents;

var getParent = require('../util/ModelingUtil').getParent;

var PlanItemDefinitionUtil = require('../util/PlanItemDefinitionUtil'),
    isItemCapable = PlanItemDefinitionUtil.isItemCapable,
    getAllDiscretionaryItems = PlanItemDefinitionUtil.getAllDiscretionaryItems,
    getDirectItemCapables = PlanItemDefinitionUtil.getDirectItemCapables,
    isHumanTask = PlanItemDefinitionUtil.isHumanTask;

var VERY_LOW_PRIORITY = 300;

/**
 * A handler responsible for adding, moving and deleting sentries.
 * These changes are reflected to the underlying CMMN 1.1 XML.
 */
function SentryUpdater(eventBus, modeling, itemRegistry, cmmnReplace, cmmnFactory) {

  var self = this;

  CommandInterceptor.call(this, eventBus);

  var containment = 'sentries';


  // CONNECTIONS ////////////////////////////////////////////////////////////

  this.postExecuted('connection.create', function(context) {

    var connection = context.connection;

    if (!isOnPartConnection(connection)) {
      return;
    }

    var onPart = getOnPart(connection),
        criterion = connection.target,
        host = criterion.host,
        sentry = getSentry(criterion);

    if (!sentry) {
      sentry = createSentry(criterion);
      modeling.updateSemanticParent(sentry, getSentryParent(host), 'sentries');
    }

    modeling.updateSemanticParent(onPart, sentry, 'onParts', connection);

  }, true);


  this.preExecuted('connection.delete', function(context) {

    var connection = context.connection;

    if (!isOnPartConnection(connection)) {
      return;
    }

    var source = connection.source,
        onPart = getOnPart(connection);

    if (existsAnotherConnection(source, connection)) {
      onPart = cloneOnPart(onPart);
      setCmmnElementRef(connection, onPart);
    }

    modeling.updateSemanticParent(onPart, null, 'onParts', connection);

  }, true);


  this.preExecuted('connection.reconnectStart', function(context) {

    var connection = context.connection,
        source = connection.source;

    if (!isOnPartConnection(connection)) {
      return;
    }

    var onPart = getOnPart(connection),
        criterion = connection.target,
        sentry = getSentry(criterion);

    if (existsAnotherConnection(source, connection)) {
      onPart = cloneOnPart(onPart);
      setCmmnElementRef(connection, onPart);
      modeling.updateSemanticParent(onPart, sentry, 'onParts', connection);
    }

  }, true);


  this.preExecuted('connection.reconnectEnd', function(context) {

    var connection = context.connection,
        source = connection.source;

    if (!isOnPartConnection(connection)) {
      return;
    }

    var onPart = getOnPart(connection),
        oldCriterion = connection.target,
        oldSentry = getSentry(oldCriterion),
        newCriterion = context.newTarget,
        newSentry = getSentry(newCriterion);

    if (oldSentry === newSentry) {
      return;
    }

    if (!newSentry) {
      newSentry = createSentry(newCriterion);
      modeling.updateSemanticParent(newSentry, getSentryParent(newCriterion.host), 'sentries');
    }

    if (existsAnotherConnection(source, connection)) {
      onPart = cloneOnPart(onPart);
      setCmmnElementRef(connection, onPart);
    }

    modeling.updateSemanticParent(onPart, newSentry, 'onParts', connection);

  }, true);


  this.postExecuted([ 'connection.create', 'connection.reconnectStart'], function(context) {

    var connection = context.connection;

    if (!isOnPartConnection(connection)) {
      return;
    }

    var onPart = getOnPart(connection),
        standardEvent;

    if (!isValidStandardEvent(connection)) {
      standardEvent = getDefaultStandardEvent(connection);
      modeling.updateProperties(onPart, {
        standardEvent: standardEvent
      }, connection);
    }

  }, true);


  // CREATE //////////////////////////////////////////////////////////////////

  this.postExecuted('element.updateAttachment', function(context) {

    var shape = context.shape;

    if (!isCriterion(shape)) {
      return;
    }

    if (shape.host) {
      self.updateSentriesSemanticParent([ shape ]);
    }
    else {
      self.deleteSentry(shape);
    }

  }, true);


  // DELETE /////////////////////////////////////////////////////////////

  this.preExecuted('shape.delete', function(context) {

    var definition = getDefinition(context.shape);

    if (!isHumanTask(definition)) {
      return;
    }

    // get remaining discretionary items
    context.discretionaryItems = context.discretionaryItems || getAllDiscretionaryItems(definition);

  }, true);


  this.postExecuted('shape.delete', VERY_LOW_PRIORITY, function(context) {

    var discretionaryItems = context.discretionaryItems,
        attachers;

    attachers = getAttachersRecurse(discretionaryItems);

    if (attachers && attachers.length) {
      self.updateSentriesSemanticParent(attachers);
    }

  }, true);


  // MOVING /////////////////////////////////////////////////////////////

  this.postExecuted([
    'connection.create',
    'connection.delete',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], VERY_LOW_PRIORITY, function(context) {

    var connection = context.connection,
        source = context.newSource || context.source || connection.source,
        target = context.newTarget || context.target || connection.target,
        shapes = [],
        attachers;

    if (!isDiscretionaryConnection(connection, source, target)) {
      return;
    }

    if (connection.target) {
      shapes.push(connection.target);
    }

    if (!connection.target && context.target) {
      shapes.push(context.target);
    }

    if (context.oldTarget) {
      shapes.push(context.oldTarget);
    }

    attachers = getAttachersRecurse(shapes);

    if (attachers && attachers.length) {
      self.updateSentriesSemanticParent(attachers);
    }

  }, true);


  this.postExecuted('elements.move', VERY_LOW_PRIORITY, function(context) {

    var shapes = context.shapes,
        newParent = context.newParent,
        oldParent = context.hints && context.hints.oldParent,
        attachers;

    if (oldParent === newParent) {
      return;
    }

    attachers = getAttachersRecurse(shapes);

    if (attachers && attachers.length) {
      self.updateSentriesSemanticParent(attachers);
    }

  }, true);


  // API //////////////////////////////////////////////////////


  /**
   * Deletes by given criteria referenced sentries, if the
   * the sentry is not referenced by any other criterion.
   *
   * @param {Object} criteria deleted criteria
   */
  this.deleteSentry = function(criterion) {

    var sentry = getSentry(criterion),
        references;

    if (sentry) {
      references = itemRegistry.getReferences(sentry);

      if (references.length <= 1) {
        modeling.updateSemanticParent(sentry, null, containment);
      }
    }

  };


  /**
   * Updates the parent of by given criteria referenced sentries.
   *
   * If the sentry is referenced by multiple criteria and only
   * a part of them has been moved, then the sentry is duplicated.
   *
   * @param {Object} criteria updated criteria
   */
  this.updateSentriesSemanticParent = function(criteria) {

    var groupedCriteria = groupBySentry(criteria),
        replacements = {};

    /**
     * Returns true if the given element is replaced
     */
    function isReplaced(elem) {
      return !!replacements[elem.id];
    }

    /**
     * Set the given old element as replaced
     * with the given new element.
     */
    function replace(oldElem, newElem) {
      replacements[oldElem.id] = newElem;
    }

    /**
     * Returns the replacement of the given element.
     * If no replacement is available the given element
     * itself is returned.
     */
    function getReplacement(elem) {
      return replacements[elem.id] || elem;
    }

    /**
     * Returns true if the sentry should be replaced.
     */
    function shouldReplace(sentry, newParent) {
      var references = itemRegistry.getReferences(sentry),
          criteria = (groupedCriteria[sentry.id] || []),
          referencesLength = itemRegistry.getReferences(sentry).length,
          criteriaLength = criteria.length;

      if (referencesLength > criteriaLength) {

        if (!newParent) {
          return true;
        }

        return some(references, function(criterion) {
          var criterionShape = itemRegistry.getShape(criterion);
          return criterionShape && newParent !== getSentryParent(criterionShape.host);
        });

      }

      return false;
    }


    handleEachElement(criteria, function(criterion) {

      var sentry = getSentry(criterion);

      if (sentry) {

        var newParent = getSentryParent(criterion.host);

        if (!newParent) {
          var parent = getParent(getBusinessObject(criterion));
          newParent = parent && getSentryParent(parent);
        }

        if (sentry.$parent === newParent) {
          return;
        }

        if (!isReplaced(sentry) && shouldReplace(sentry, newParent)) {
          var newSentry = cmmnReplace.replaceSentry(sentry);
          replace(sentry, newSentry);

          forEach(criterion.incoming, function(con) {

            var cmmnElement = con.businessObject.cmmnElementRef;
            if (cmmnElement && is(cmmnElement, 'cmmn:OnPart')) {
              replace(cmmnElement, cloneOnPart(cmmnElement));
            }

          });
        }

        sentry = getReplacement(sentry);

        if (getSentry(criterion) !== sentry) {
          setSentryRef(criterion, sentry);
        }

        forEach(criterion.incoming, function(con) {

          var cmmnElement = con.businessObject.cmmnElementRef;
          if (cmmnElement && is(cmmnElement, 'cmmn:OnPart')) {

            var replaceBy = getReplacement(cmmnElement);

            if (replaceBy && cmmnElement !== replaceBy) {
              setCmmnElementRef(con, replaceBy);
              modeling.updateSemanticParent(replaceBy, sentry, 'onParts');
            }

          }

        });

        modeling.updateSemanticParent(sentry, newParent, containment);

      }

    });

  };


  // UTILITIES /////////////////////////////////////////////////////////////////


  function getAttachersRecurse(shapes) {

    var attachers = getAttachers(shapes);

    handleEachElement(shapes, function(shape) {

      var definition = getDefinition(shape);

      if (isHumanTask(definition)) {

        var items = getAllDiscretionaryItems(shape);

        if (items && items.length) {
          attachers = attachers.concat(getAttachers(items));
        }

        return items;
      }

      return getDirectItemCapables(shape);

    });

    return flatten(attachers);
  }


  function handleEachElement(shapes, fn) {

    var handledElements = {};

    function handled(element) {
      handledElements[element.id] = element;
    }

    function isHandled(element) {
      return !!handledElements[element.id];
    }

    function eachElement(elements, isRoot) {
      forEach(elements, function(element) {

        if (!isHandled(element)) {
          handled(element);

          element = itemRegistry.getShape(element.id) || element;

          var children = fn(element);

          if (children && children.length) {
            eachElement(children);
          }
        }

        if (isRoot) {
          handledElements = {};
        }

      });
    }

    eachElement(shapes, true);
  }

  function createSentry(criterion) {
    var sentry = cmmnFactory.createSentry();
    setSentryRef(criterion, sentry);
    return sentry;
  }

  function setSentryRef(criterion, sentry) {
    modeling.updateProperties(criterion, {
      sentryRef: sentry
    });
  }

  function setCmmnElementRef(connection, ref) {
    modeling.updateProperties(connection, {
      cmmnElementRef: ref
    });
  }

  function cloneOnPart(onPart) {
    var attrs = {
      name: onPart.name,
      sourceRef: onPart.sourceRef,
      standardEvent: onPart.standardEvent
    };

    if (is(onPart, 'cmmn:PlanItemOnPart')) {
      attrs.exitCriterionRef = onPart.exitCriterionRef;
    }

    return cmmnFactory.create(onPart.$type, attrs);
  }


  function isOnPartConnection(connection) {
    var cmmnElement = connection.businessObject.cmmnElementRef;
    return is(cmmnElement, 'cmmn:OnPart');
  }

  function isDiscretionaryConnection(connection, source, target) {
    return !connection.businessObject.cmmnElementRef;
  }

}

SentryUpdater.$inject = [
  'eventBus',
  'modeling',
  'itemRegistry',
  'cmmnReplace',
  'cmmnFactory'
];

inherits(SentryUpdater, CommandInterceptor);

module.exports = SentryUpdater;


/**
 * Returns based on the given host the parent
 * for a sentry.
 *
 * @param {djs.model.Base} host
 *
 * @result {ModdleElement} parent
 */
function getSentryParent(host) {

  if (isCasePlanModel(host)) {
    return getBusinessObject(host);
  }

  if (isItemCapable(host)) {
    var bo = getBusinessObject(host);
    return getParent(bo, 'cmmn:PlanFragment');
  }

}


/**
 * Returns all attachers for the given shapes.
 *
 * @param {Array<djs.model.Base>} shapes
 *
 * @result {Array<djs.model.Base>} attachers
 */
function getAttachers(shapes) {
  return flatten(map(shapes, function(s) {
    var attachers = [];

    if (s.attachers) {
      attachers = s.attachers;
    }
    else {
      var bo = getBusinessObject(s);

      var exitCriteria = bo.get('exitCriteria');
      forEach(exitCriteria, function(criterion) {
        attachers.push(criterion);
      });

      var entryCriteria = bo.get('entryCriteria');
      forEach(entryCriteria, function(criterion) {
        attachers.push(criterion);
      });
    }

    return attachers || [];
  }));
}


/**
 * Groups given criteria by sentry.
 *
 * @param {Object} criteria group by id
 *
 * @result {Object} criteria grouped by sentry
 */
function groupBySentry(criteria) {
  return groupBy(criteria, function(criterion) {
    var sentry = getSentry(criterion);
    return sentry && sentry.id;
  });
}


/**
 * Returns true if the given element is a criterion.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean}
 */
function isCriterion(element) {
  return is(element, 'cmmn:Criterion');
}

function existsAnotherConnection(source, connection) {
  var onPart = getOnPart(connection);
  return some(source.outgoing, function(con) {
    return connection !== con && onPart === getOnPart(con);
  });
}

function getOnPart(connection) {
  connection = getBusinessObject(connection);
  return connection.cmmnElementRef;
}

function isValidStandardEvent(connection) {

  var onPart = getOnPart(connection),
      standardEvent = onPart.standardEvent,
      possibleStandardEvents = getStandardEvents(onPart);

  return standardEvent && possibleStandardEvents.indexOf(standardEvent) !== -1;

}

function getDefaultStandardEvent(element) {

  element = getOnPart(element);

  if (is(element.sourceRef, 'cmmn:CaseFileItem')) {
    return 'update';
  }

  if (is(element.exitCriterionRef, 'cmmn:ExitCriterion')) {
    return 'exit';
  }

  if (is(element.sourceRef, 'cmmn:PlanItem')) {

    var definition = getDefinition(element.sourceRef);
    if (is(definition, 'cmmn:EventListener') || is(definition, 'cmmn:Milestone')) {
      return 'occur';
    }
    else {
      return 'complete';
    }

  }

}
