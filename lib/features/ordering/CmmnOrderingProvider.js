'use strict';

var inherits = require('inherits');

var OrderingProvider = require('diagram-js/lib/features/ordering/OrderingProvider').default;
var findIndex = require('min-dash').findIndex;
var find = require('min-dash').find;
var is = require('../../util/ModelUtil').is;
var isAny = require('../modeling/util/ModelingUtil').isAny;

function CmmnOrderingProvider(eventBus) {

  OrderingProvider.call(this, eventBus);

  var orders = [
    { type: 'label', order: { level: 10 } },
    { type: 'cmmn:Criterion', order: { level: 6 } },
    {
      type: 'cmmn:OnPart',
      order: {
        level: 9,
        containers: [
          'cmmn:Stage'
        ]
      }
    },
    {
      type: 'cmmn:Association',
      order: {
        level: 9,
        containers: [
          'cmmndi:CMMNDiagram'
        ]
      }
    },
    {
      type: 'cmmndi:CMMNEdge',
      order: {
        level: 9,
        containers: [
          'cmmn:PlanItem',
          'cmmn:DiscretionaryItem',
          'cmmn:Stage'
        ]
      }
    }
  ];

  function computeOrder(element) {

    if (isCMMNEdge(element)) {
      element = element.businessObject.cmmnElementRef || element;
    }

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

  function findActualParent(element, newParent, containers) {

    var actualParent = newParent;

    if (isCMMNEdge(element) && element.source) {
      actualParent = element.source.parent;
    }

    while (actualParent) {

      if (isAny(actualParent, containers)) {
        break;
      }

      actualParent = actualParent.parent;
    }

    if (!actualParent) {
      throw new Error('no parent for ' + element.id + ' in ' + newParent.id);
    }

    return actualParent;
  }

  this.getOrdering = function(element, newParent) {

    var elementOrder = getOrder(element);

    if (elementOrder.containers) {
      newParent = findActualParent(element, newParent, elementOrder.containers);
    }

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
    // a smaller index, we need to adjust the insert index.
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

function isCMMNEdge(element) {
  return is(element, 'cmmndi:CMMNEdge');
}