'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is;
var forEach = require('lodash/collection/forEach');
var filter = require('lodash/collection/filter');

function ReplaceElementBehavior(
  cmmnReplace,
  cmmnRules,
  elementFactory,
  elementRegistry,
  eventBus,
  selection
) {

  CommandInterceptor.call(this, eventBus);

  this._cmmnReplace = cmmnReplace;
  this._elementRegistry = elementRegistry;
  this._selection = selection;

  var self = this;


  this.preExecute('shape.create', function(context) {
    var shape = context.shape,
        host = context.host;

    if (host && is(shape, 'cmmn:Criterion')) {

      var canReplace = cmmnRules.canReplace([ shape ], host, context.position);

      if (canReplace && canReplace.replacements) {

        var replacement = canReplace.replacements[0],
            newElementType = replacement.newElementType;
        
        context.shape = elementFactory.createCriterionShape(newElementType);

      }
    }

  }, true);


  this.postExecuted([ 'elements.move' ], 500, function(event) {

    var context = event.context,
        target = context.newParent,
        newHost = context.newHost,
        elements = context.shapes.slice();

    if (elements.length === 1 && newHost) {
      target = newHost;
    }
    else {
      elements = filter(elements, function(elem) {
        return !is(elem, 'cmmn:Criterion');
      });
    }

    var canReplace = cmmnRules.canReplace(elements, target);

    if (canReplace) {
      self.replaceElements(elements, canReplace.replacements);
    }
  }, this);


  // update attachments if the host is replaced
  this.postExecute([ 'shape.replace' ], 1500, function(e) {

    var context = e.context,
        oldShape = context.oldShape,
        newShape = context.newShape,
        attachers = oldShape.attachers,
        canReplace;

    if (attachers && attachers.length) {
      canReplace = cmmnRules.canReplace(attachers, newShape);

      if (canReplace) {
        self.replaceElements(attachers, canReplace.replacements);
      }
    }

  }, this);


  this.postExecuted([ 'element.updateProperties' ], function(context) {

    var newProperties = context.properties,
        changed = context.changed;

    if (newProperties.isBlocking === false) {

      forEach(changed, function(shape) {

        var attachers = shape.attachers,
            canReplace = cmmnRules.canReplace(attachers, shape);

        if (canReplace) {
          self.replaceElements(attachers, canReplace.replacements);
        }
      });

    }


  }, true);


  this.replaceElements = function(elements, newElements) {

    var elementRegistry = this._elementRegistry,
        cmmnReplace = this._cmmnReplace,
        selection = this._selection;

    forEach(newElements, function(replacement) {

      var newElement = {
        type: replacement.newElementType
      };

      var oldElement = elementRegistry.get(replacement.oldElementId),
          idx = elements.indexOf(oldElement);

      elements[idx] = cmmnReplace.replaceElement(oldElement, newElement, { select: false });


    });

    if (newElements) {
      selection.select(elements);
    }
  };

}


ReplaceElementBehavior.$inject = [
  'cmmnReplace',
  'cmmnRules',
  'elementFactory',
  'elementRegistry',
  'eventBus',
  'selection'
];

inherits(ReplaceElementBehavior, CommandInterceptor);

module.exports = ReplaceElementBehavior;
