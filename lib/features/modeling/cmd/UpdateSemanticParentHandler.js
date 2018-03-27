'use strict';

var flatten = require('min-dash').flatten;

var Collections = require('diagram-js/lib/util/Collections');


function UpdateSemanticParentHandler() {
}

module.exports = UpdateSemanticParentHandler;


// api /////////////////

UpdateSemanticParentHandler.prototype.preExecute = function(context) {
  var element = context.element,
      shape = context.shape;

  if (!element) {
    throw new Error('element required');
  }

  var bo = element.businessObject || element;

  context.businessObject = bo;
  context.oldParent = bo.$parent;

  var changed = [];

  if (element.businessObject) {
    changed.push(element);
  }

  if (shape) {
    changed.push(shape);
  }

  context.changed = flatten(changed);
};

UpdateSemanticParentHandler.prototype.execute = function(context) {

  var businessObject = context.businessObject,
      newParent = context.newParent,
      containment = context.containment;

  this.updateSemanticParent(businessObject, newParent, containment);

  // indicate changed on objects affected by the update
  return context.changed;
};


UpdateSemanticParentHandler.prototype.revert = function(context) {

  var businessObject = context.businessObject,
      newParent = context.oldParent,
      containment = context.containment;

  this.updateSemanticParent(businessObject, newParent, containment);

  return context.changed;
};


UpdateSemanticParentHandler.prototype.updateSemanticParent = function(element, newParent, containment) {

  if (element.$parent === newParent) {
    return;
  }

  var children;

  if (element.$parent && containment) {
    // remove from old parent
    children = element.$parent.get(containment);
    Collections.remove(children, element);
  }

  element.$parent = null;

  if (newParent) {

    if (containment) {
      // add to new parent
      children = newParent.get(containment);
      children.push(element);
    }

    element.$parent = newParent;
  }

};
