'use strict';

var inherits = require('inherits');

var is = require('../../../util/ModelUtil').is;


function AppendShapeHandler(modeling, cmmnRules) {
  this._modeling = modeling;
  this._cmmnRules = cmmnRules;
}

inherits(AppendShapeHandler, require('diagram-js/lib/features/modeling/cmd/AppendShapeHandler'));


AppendShapeHandler.$inject = [ 'modeling', 'cmmnRules' ];

module.exports = AppendShapeHandler;


////// api /////////////////////////////////////////////

AppendShapeHandler.prototype.preExecute = function(context) {

  if (!context.source) {
    throw new Error('source required');
  }

  var cmmnRules = this._cmmnRules;

  var shape = context.shape,
      source = context.source,
      parent = context.parent || context.source.parent,
      position = context.position,
      isAttach = false;

  if (isCriterion(shape)) {
    isAttach = cmmnRules.canAttach(shape, parent, source, position) === 'attach';
  }

  context.shape = this._modeling.createShape(shape, position, parent, isAttach, {
    nested: true
  });

};

function isCriterion(element) {
  return is(element, 'cmmn:Criterion');
}