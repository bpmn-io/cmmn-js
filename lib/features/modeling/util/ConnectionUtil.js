'use strict';

var is = require('../../../util/ModelUtil').is,
    getDefinition = require('../../../util/ModelUtil').getDefinition;

var isDiscretionaryItem = require('./PlanItemDefinitionUtil').isDiscretionaryItem,
    isHumanTask = require('./PlanItemDefinitionUtil').isHumanTask;

/**
 * Returns true, if the given connection is discretionary connection.
 *
 * A connection is a discretionary connection, if
 * - its type is 'cmmndi:CMMNEdge'
 * - the attribute 'cmmnElementRef' is undefined
 * - the source is defined by a human task
 * - the target is a discretionary item
 *
 * @param {djs.model.Base} connection to check
 * @param {djs.model.Base} source of connection, if
 *                                'connection.source' is not defined yet
 * @param {djs.model.Base} target of connection, if
 *                                'connection.target' is not defined yet
 *
 * @return {boolean} returns true, if it is a discretionary connection
 */
function isDiscretionaryConnection(connection, source, target) {

  if (!is(connection, 'cmmndi:CMMNEdge')) {
    return false;
  }

  if (connection.cmmnElementRef) {
    return false;
  }

  if (source || connection.source) {
    source = getDefinition(connection.source || source);
    if (!isHumanTask(source)) {
      return false;
    }
  }

  if (target || connection.target) {
    if (!isDiscretionaryItem(connection.target || target)) {
      return false;
    }
  }

  return true;
}

module.exports.isDiscretionaryConnection = isDiscretionaryConnection;
