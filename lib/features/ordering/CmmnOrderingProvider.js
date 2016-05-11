'use strict';

var inherits = require('inherits');

var OrderingProvider = require('diagram-js/lib/features/ordering/OrderingProvider');
var findIndex = require('lodash/array/findIndex');
var find = require('lodash/collection/find');
var is = require('../../util/ModelUtil').is;

function CmmnOrderingProvider(eventBus) {

  OrderingProvider.call(this, eventBus);

  var orders = [
    { type: 'label', order: { level: 10 } },
    { type: 'cmmn:Criterion', order: { level: 9 } }
  ];

  function computeOrder(element) {
    var entry = find(orders, function(o) {
      return is(element, o.type);
    });

    return entry && entry.order || { level: 1 };
  }

  function getOrder(element) {

    var order = element.order;

    if (!order) {
      element.order = order = computeOrder(element);
    }

    return order;
  }

  this.getOrdering = function(element, newParent) {

    var elementOrder = getOrder(element);

    var currentIndex = newParent.children.indexOf(element);

    var insertIndex = findIndex(newParent.children, function(child) {

      // do not compare with labels, they are created
      // in the wrong order (right after elements) during import and
      // mess up the positioning.
      if (!element.labelTarget && child.labelTarget) {
        return false;
      }

      return elementOrder.level < getOrder(child).level;
    });


    // if the element is already in the child list at
    // a smaller index, we need to adjust the inser index.
    // this takes into account that the element is being removed
    // before being re-inserted
    if (insertIndex !== -1) {
      if (currentIndex !== -1 && currentIndex < insertIndex) {
        insertIndex -= 1;
      }
    }

    return {
      index: insertIndex,
      parent: newParent
    };

  };
}

CmmnOrderingProvider.$inject = [ 'eventBus' ];

inherits(CmmnOrderingProvider, OrderingProvider);

module.exports = CmmnOrderingProvider;