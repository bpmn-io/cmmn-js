var SnapUtil = require('diagram-js/lib/features/snapping/SnapUtil'),
    mid =SnapUtil.mid,
    setSnapped = SnapUtil.setSnapped;

var isCmd = require('diagram-js/lib/features/keyboard/KeyboardUtil').isCmd;

var ModelUtil = require('../../util/ModelUtil'),
    is = ModelUtil.is,
    getDefinition = ModelUtil.getDefinition,
    getBusinessObject = ModelUtil.getBusinessObject;

var HIGHER_PRIORITY = 1250;


/**
   * Snap during connect.
   *
   * @param {EventBus} eventBus
   * @param {Rules} rules
   */
function CmmnConnectSnapping(eventBus, rules) {
  eventBus.on([
    'connect.hover',
    'connect.move',
    'connect.end',
  ], HIGHER_PRIORITY, function(event) {
    var context = event.context,
        source = context.source,
        target = context.target,
        canExecute = context.canExecute;

    if (!canExecute) {
      return;
    }

    if (event.originalEvent && isCmd(event.originalEvent)) {
      return;
    }

    if (!context.initialSourcePosition) {
      context.initialSourcePosition = context.sourcePosition;
    }

    var connectionAttrs = rules.allowed('connection.create', {
      source: source,
      target: target
    });

    if (connectionAttrs && isCenterSnapTarget(source)) {
      // snap source
      context.sourcePosition = mid(source);
    }

    if (connectionAttrs && isCenterSnapTarget(target)) {

      // snap target
      snapToPosition(event, mid(target));
    }
  });
}

CmmnConnectSnapping.$inject = [
  'eventBus',
  'rules'
];

module.exports = CmmnConnectSnapping;

// helpers //////////

function snapToPosition(event, position) {
  setSnapped(event, 'x', position.x);
  setSnapped(event, 'y', position.y);
}

/**
 * Returns true if element should be center snapped when
 * creating a connection.
 *
 * This applies to all collapsed and non container elements.
 *
 * @param {djs.model.Base} element
 *
 * @return {Boolean}
 */
function isCenterSnapTarget(element) {

  if (!element) {
    return false;
  }

  if (is(element, 'cmmn:Stage')) {
    return false;
  }

  var bo = getBusinessObject(element);
  var definition = getDefinition(element) || element;

  if (!is(definition, 'cmmn:PlanFragment')) {
    return true;
  }

  var di = bo.di;

  if (di && di.isCollapsed === true) {
    return true;
  }

  return false;
}