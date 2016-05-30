'use strict';

var isAny = require('../modeling/util/ModelingUtil').isAny;

/**
 * Extention of GlobalConnect tool that implements CMMN specific rules about
 * connection start elements.
 */
function CmmnGlobalConnect(globalConnect) {
  globalConnect.registerProvider(this);
}

CmmnGlobalConnect.$inject = [ 'globalConnect' ];

module.exports = CmmnGlobalConnect;


/**
 * Checks if given element can be used for starting connection.
 *
 * @param  {Element} source
 * @return {Boolean}
 */
CmmnGlobalConnect.prototype.canStartConnect = function(source) {

  if (nonExistantOrLabel(source)) {
    return null;
  }

  var businessObject = source.businessObject;

  return isAny(businessObject, [
    'cmmn:CaseFileItem',
    'cmmn:Criterion',
    'cmmn:DiscretionaryItem',
    'cmmn:PlanItem'
  ]);
};


function nonExistantOrLabel(element) {
  return !element || isLabel(element);
}

function isLabel(element) {
  return element.labelTarget;
}


