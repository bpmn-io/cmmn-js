'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var forEach = require('lodash/collection/forEach'),
    reduce = require('lodash/collection/reduce'),
    flatten = require('lodash/array/flatten'),
    groupBy = require('lodash/collection/groupBy'),
    map = require('lodash/collection/map');

var ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    getSentry = ModelUtil.getSentry,
    getBusinessObject = ModelUtil.getBusinessObject,
    getDefinition = ModelUtil.getDefinition;

var getParent = require('../util/ModelingUtil').getParent;

var PlanItemDefinitionUtil = require('../util/PlanItemDefinitionUtil'),
    isItemCapable = PlanItemDefinitionUtil.isItemCapable,
    getAllDiscretionaryItems = PlanItemDefinitionUtil.getAllDiscretionaryItems,
    getDirectItemCapables = PlanItemDefinitionUtil.getDirectItemCapables,
    isHumanTask = PlanItemDefinitionUtil.isHumanTask;

var isDiscretionaryConnection = require('../util/ConnectionUtil').isDiscretionaryConnection;

var VERY_LOW_PRIORITY = 300;

/**
 * A handler responsible for adding, moving and deleting sentries.
 * These changes are reflected to the underlying CMMN 1.1 XML.
 */
function SentryUpdater(eventBus, modeling, elementRegistry, cmmnReplace) {

  var self = this;

  CommandInterceptor.call(this, eventBus);

  var containment = 'sentries';


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
      var query = {};
      query[sentry.id] = sentry;
      references = getReferencingCriteria(query);
    
      if (sentry && (!references[sentry.id] || references[sentry.id].length <= 1)) {
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

    var sentries = getSentries(criteria),
        groupedCriteria = groupBySentry(criteria),
        references = getReferencingCriteria(sentries),
        replacements = {};

    /**
     * Returns true if the given element is replaced
     */ 
    function isReplaced(sentry) {
      return !!replacements[sentry.id];
    }

    /**
     * Set the given old sentry as replaced
     * with the given new sentry.
     */
    function replace(oldSentry, newSentry) {
      replacements[oldSentry.id] = newSentry;
    }

    /**
     * Returns the replacement of the given sentry.
     * If no replacement is available the given sentry
     * itself is returned.
     */
    function getReplacement(sentry) {
      return replacements[sentry.id] || sentry;
    }

    /**
     * Returns true if the sentry should be replaced.
     */
    function shouldReplace(sentry) {
      var referencesLength = (references[sentry.id] || []).length,
          groupedCriteriaLength = (groupedCriteria[sentry.id] || []).length;
      return referencesLength > groupedCriteriaLength;
    }


    handleEachElement(criteria, function(criterion) {

      var sentry = getSentry(criterion);

      if (sentry) {

        var newParent = getSentryParent(criterion.host);

        if (!newParent) {
          var parent = getParent(getBusinessObject(criterion));
          var parentShape = parent && elementRegistry.get(parent.id);

          newParent = parentShape && getSentryParent(parentShape);
        }

        if (sentry.$parent === newParent) {
          return;
        }

        if (!isReplaced(sentry) && shouldReplace(sentry)) {
          var newSentry = cmmnReplace.replaceSentry(sentry);
          replace(sentry, newSentry);
        }

        sentry = getReplacement(sentry);

        if (getSentry(criterion) !== sentry) {
          modeling.updateProperties(criterion, {
            sentryRef: sentry
          });
        }

        modeling.updateSemanticParent(sentry, newParent, containment);

      }

    });

  };


  // UTILITIES /////////////////////////////////////////////////////////////////


  /**
   * Returns for each given sentry an array of criteria referencing this sentry.
   *
   * The result is grouped by the given sentries.
   *
   * @param {Object} sentries by id
   *
   * @result {Object} referenced criteria grouped by its sentry
   */
  function getReferencingCriteria(sentries) {
    return groupBy(elementRegistry.filter(filterBySentryRef(sentries)), function(criterion) {
      return getSentry(criterion).id;
    });
  }


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

          element = elementRegistry.get(element.id) || element;

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

}

SentryUpdater.$inject = [ 'eventBus', 'modeling', 'elementRegistry', 'cmmnReplace' ];

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
 * Returns a filter function which can be used to filter
 * for elements referencing one of the given sentries.
 *
 * @param {Object} sentries used in filter
 *
 * @result {Function} a filter function
 */
function filterBySentryRef(sentries) {
  return function(element) {
    var sentry = getSentry(element);
    return !!(sentry && sentries[sentry.id]);
  };
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
 * Returns all referenced sentries referenced by
 * the given criteria.
 *
 * @param {Object} criteria group by id
 *
 * @result {Object} sentries grouped by id
 */
function getSentries(criteria) {
  return reduce(criteria, function(result, criterion) {

    var sentry = getSentry(criterion);

    if (sentry) {
      result[sentry.id] = sentry;
    }

    return result;
  }, {});
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
