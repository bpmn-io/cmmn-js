'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor').default;

var forEach = require('min-dash').forEach;
var filter = require('min-dash').filter;
var reduce = require('min-dash').reduce;

var ModelUtil = require('../../../util/ModelUtil'),
    getDefinition = ModelUtil.getDefinition,
    getBusinessObject = ModelUtil.getBusinessObject,
    is = ModelUtil.is;

var ModelingUtil = require('../util/ModelingUtil'),
    getCase = ModelingUtil.getCase,
    getParent = ModelingUtil.getParent,
    isSameCase = ModelingUtil.isSameCase,
    isLabel = ModelingUtil.isLabel;


function CaseFileItemUpdater(
    eventBus,
    itemRegistry,
    cmmnFactory,
    modeling
) {

  this._cmmnFactory = cmmnFactory;
  this._modeling = modeling;

  CommandInterceptor.call(this, eventBus);

  var containment = 'caseFileItems';


  this.preExecuted('shape.create', function(context) {

    var shape = context.shape,
        parent = context.parent,
        parentBusinessObject = getBusinessObject(parent),
        definitions,
        caseFileItemDefinition,
        caseFileModel;


    if (!isCaseFileItem(shape)) {
      return;
    }

    caseFileItemDefinition = getDefinition(shape);

    if (caseFileItemDefinition) {
      definitions = getDefinitions(parentBusinessObject);
      modeling.updateSemanticParent(caseFileItemDefinition, definitions, 'caseFileItemDefinitions');
    }

    caseFileModel = createCaseFileModel(parent);

    modeling.updateSemanticParent(shape, caseFileModel, containment);

  }, true);




  this.preExecuted('elements.move', function(context) {

    var newParent = context.newParent,
        hints = context.hints,
        oldParent = hints && hints.primaryShape && hints.primaryShape.parent,
        closure = context.closure || {},
        shapes = closure.allShapes,
        caseFileModel;


    if (!newParent || oldParent === newParent) {
      return;
    }


    shapes = filter(shapes, function(shape) {
      return isCaseFileItem(shape) && !isLabel(shape) && !isSameCase(shape.parent, newParent);
    });

    if (shapes && shapes.length) {

      caseFileModel = createCaseFileModel(newParent);

      shapes = toMap(shapes);

      forEach(shapes, function(shape) {

        var caseFileItem = getBusinessObject(shape),
            oldCaseFileModel = getParentCaseFile(caseFileItem),
            oldSemanticParent = getParent(caseFileItem);

        if (isCaseFileModel(oldSemanticParent)) {

          modeling.updateSemanticParent(shape, caseFileModel, containment);

        }
        else {

          var parentCaseFileItem = getParent(caseFileItem, 'cmmn:CaseFileItem');
          if (!shapes[parentCaseFileItem.id]) {
            modeling.updateSemanticParent(shape, caseFileModel, containment);
          }

        }

        var source = caseFileItem.sourceRef;
        if (source && !shapes[source.id]) {
          clearSourceRef(caseFileItem);
        }

        clearTargetRefs(caseFileItem, function(target) {
          return !shapes[target.id];
        });


        moveChildren(caseFileItem, oldCaseFileModel, function(child) {
          return !shapes[child.id];
        });

        clearCaseFileItemContainer(oldSemanticParent);

      });

    }

  }, true);


  this.postExecuted('shape.delete', function(context) {

    var shape = context.shape,
        bo = getBusinessObject(shape),
        caseFileItemDefinition;

    if (!isCaseFileItem(shape) || isLabel(shape)) {
      return;
    }

    var oldSemanticParent = getParent(bo),
        caseFileModel = getParentCaseFile(bo);

    modeling.updateSemanticParent(shape, null, containment);

    clearSourceRef(shape);
    clearTargetRefs(shape);
    moveChildren(bo, caseFileModel);

    clearCaseFileItemContainer(oldSemanticParent);

    if (isExlusiveRef(shape)) {
      caseFileItemDefinition = getDefinition(shape);
      modeling.updateSemanticParent(caseFileItemDefinition, null, 'caseFileItemDefinitions');
    }

  }, true);



  function createCaseFileModel(element) {
    var _case = getCase(element),
        caseFileModel = _case.caseFileModel;

    if (!caseFileModel) {
      caseFileModel = cmmnFactory.createCaseFileModel(_case);
      modeling.updateProperties(_case, { caseFileModel: caseFileModel });
    }

    return caseFileModel;
  }


  function clearCaseFileItemContainer(container) {
    var items = container && container.get(containment);

    if (items && !items.length) {

      var prop = 'caseFileModel',
          parent = container.$parent;

      if (!isCaseFileModel(container)) {
        prop = 'children';
      }

      var update = {};
      update[prop] = undefined;

      modeling.updateProperties(parent, update);
      modeling.updateSemanticParent(container);
    }

  }


  function clearSourceRef(target) {
    target = getBusinessObject(target);

    var source = target.sourceRef;

    if (source) {
      clearTargetRefs(source, function(elem) {
        return target === elem;
      });

      modeling.updateProperties(target, { sourceRef: undefined });
    }

  }


  function clearTargetRefs(source, canRemoveFilter) {
    source = getBusinessObject(source);

    var targets = source && source.get('targetRefs'),
        copy;

    if (targets && targets.length) {

      copy = targets.slice();

      forEach(targets, function(target) {

        var canRemove = !canRemoveFilter || canRemoveFilter(target);

        if (canRemove) {

          if (target.sourceRef === source) {
            modeling.updateProperties(target, { sourceRef: undefined });
          }

          var idx = copy.indexOf(target);
          if (idx !== -1) {
            copy.splice(idx, 1);
          }

        }

      });

      if (targets.length !== copy.length) {
        modeling.updateProperties(source, { targetRefs: copy });
      }

    }

  }


  function moveChildren(caseFileItem, newParent, canMoveFilter) {
    caseFileItem = getBusinessObject(caseFileItem);

    var childrenElement = caseFileItem.children,
        children = childrenElement && childrenElement.get(containment);

    if (children && children.length) {

      forEach(children, function(child) {

        var canMove = !canMoveFilter || canMoveFilter(child);

        if (canMove) {
          modeling.updateSemanticParent(child, newParent, containment);
        }

      });

      clearCaseFileItemContainer(childrenElement);

    }

  }


  function isExlusiveRef(element) {
    var definition = getDefinition(element);
    return definition && itemRegistry.getReferences(definition).length === 1;
  }

}

CaseFileItemUpdater.$inject = [
  'eventBus',
  'itemRegistry',
  'cmmnFactory',
  'modeling'
];

inherits(CaseFileItemUpdater, CommandInterceptor);

module.exports = CaseFileItemUpdater;


function getDefinitions(element) {
  return getParent(element, 'cmmn:Definitions');
}


function isCaseFileItem(element) {
  return is(element, 'cmmn:CaseFileItem');
}


function isCaseFileModel(element) {
  return is(element, 'cmmn:CaseFile');
}


function toMap(elements) {
  return reduce(elements, function(result, value) {
    result[value.id] = value;
    return result;
  }, {});
}


function getParentCaseFile(element) {
  return getParent(getBusinessObject(element), 'cmmn:CaseFile');
}