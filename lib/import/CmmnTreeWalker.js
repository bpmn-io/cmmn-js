'use strict';

var forEach = require('min-dash').forEach,
    filter = require('min-dash').filter;

var Refs = require('object-refs');

var elementToString = require('./Util').elementToString;
var is = require('../util/ModelUtil').is;

var Collections = require('diagram-js/lib/util/Collections');

var diRefs = new Refs({ name: 'cmmnElement', enumerable: true }, { name: 'di' });


function CmmnTreeWalker(handler) {

  // list of elements to handle deferred to ensure
  // prerequisites are drawn
  var deferred = [];

  // list of CMMNEdges which cmmnElementRef is equals null:
  // - it is a connection which does not have a representation
  //   in case plan model
  // - it is a connection between a human (plan item) task and a
  //   discretionary item
  var connections = [];

  var discretionaryConnections = {};

  // list of cases to draw
  var cases = [];

  var handledDiscretionaryItems = {};

  // list of elements (textAnnotations and caseFileItems)
  var elementsWithoutParent = [];

  var associations = [];

  // Helpers /////////////////

  function isDiscretionaryItemHandled(item) {
    return !!handledDiscretionaryItems[item.id];
  }

  function handledDiscretionaryItem(item) {
    handledDiscretionaryItems[item.id] = item;
  }

  /**
   * Returns the surrounding 'cmmn:Case' element
   *
   * @param {ModdleElement} element
   *
   * @return {ModdleElement} the surrounding case
   */
  function getCase(element) {
    while (element && !is(element, 'cmmn:Case')) {
      element = element.$parent;
    }
    return element;
  }

  function visit(element, ctx) {
    // call handler
    return handler.element(element, ctx);
  }

  function visitRoot(element, diagram) {
    return handler.root(element, diagram);
  }

  function visitIfDi(element, ctx) {
    try {
      handler.addItem(element);
      return element.di && visit(element, ctx);
    } catch (e) {
      logError(e.message, { element: element, error: e });

      console.error('failed to import ' + elementToString(element));
      console.error(e);
    }
  }

  function logError(message, context) {
    handler.error(message, context);
  }


  function contextual(fn, ctx) {
    return function(e) {
      fn(e, ctx);
    };
  }

  // DI handling /////////////////

  function registerDi(di) {

    var cmmnElement = di.cmmnElementRef;

    if (cmmnElement && !is(di, 'cmmndi:CMMNEdge')) {

      if (cmmnElement.di) {
        logError('multiple DI elements defined for ' + elementToString(cmmnElement), { element: cmmnElement });
      }
      else {

        var _case = getCase(cmmnElement);
        if (_case && cases.indexOf(_case) === -1) {
          // add _case to the list of cases
          // that should be drawn
          cases.push(_case);
        }

        if (is(cmmnElement, 'cmmn:TextAnnotation') || is(cmmnElement, 'cmmn:CaseFileItem')) {
          elementsWithoutParent.push(cmmnElement);
        }

        diRefs.bind(cmmnElement, 'di');
        cmmnElement.di = di;
      }

    }
    else if (is(di, 'cmmndi:CMMNEdge')) {
      var shouldHandle = true;

      if (!isReferencingTarget(di)) {
        shouldHandle = false;
        logError('no target referenced in ' + elementToString(di), { element: di });
      }

      if (!isReferencingSource(di)) {
        shouldHandle = false;
        logError('no source referenced in ' + elementToString(di), { element: di });
      }

      if (shouldHandle) {

        if (is(cmmnElement, 'cmmn:Association')) {
          associations.push(di);
        }
        else if (!cmmnElement) {
          var source = di.sourceCMMNElementRef;
          discretionaryConnections[source.id] = discretionaryConnections[source.id] || [];
          discretionaryConnections[source.id].push(di);
        }
        else {
          connections.push(function(ctx) {
            handleConnection(di, ctx);
          });
        }
      }

    }
    else {
      logError('no cmmnElement referenced in ' + elementToString(di), { element: di });
    }
  }

  function isReferencingTarget(edge) {
    if (is(edge.cmmnElementRef, 'cmmn:Association')) {
      return !!edge.cmmnElementRef.targetRef;
    }

    return !!edge.targetCMMNElementRef;
  }

  function isReferencingSource(edge) {
    if (is(edge.cmmnElementRef, 'cmmn:OnPart')) {
      return !!(edge.cmmnElementRef.exitCriterionRef || edge.cmmnElementRef.sourceRef);
    }

    if (is(edge.cmmnElementRef, 'cmmn:Association')) {
      return !!edge.cmmnElementRef.sourceRef;
    }

    return !!edge.sourceCMMNElementRef;
  }

  function handleConnection(connection, context) {
    visit(connection, context);
  }

  function handleDiagram(diagram) {
    handleDiagramElements(diagram.diagramElements);
  }

  function handleDiagramElements(diagramElements) {
    forEach(diagramElements, handleDiagramElement);
  }

  function handleDiagramElement(diagramElement) {
    registerDi(diagramElement);
  }

  // Semantic handling /////////////////

  function handleDefinitions(definitions, diagram) {
    // make sure we walk the correct cmmnElement

    var cmmndi = definitions.CMMNDI;

    // no di -> nothing to import
    if (!cmmndi) {
      return;
    }

    var diagrams = cmmndi.diagrams;

    if (diagram && diagrams.indexOf(diagram) === -1) {
      throw new Error('diagram not part of cmmn:Definitions');
    }

    if (!diagram && diagrams && diagrams.length) {
      diagram = diagrams[0];
    }

    // handle only the first diagram and ignore others
    handleDiagram(diagram);

    var context = visitRoot(diagram, diagram);

    handleCases(cases, context);

    forEach(elementsWithoutParent, contextual(handleElementWithoutParent));
    forEach(associations, contextual(handleAssociation));
  }

  function handleCases(cases, context) {
    forEach(cases, function(_case) {
      handleCase(_case, context);

      // clear collections for the next iteration
      deferred = [];
      connections = [];
    });
  }

  function handleCase(_case, context) {
    var casePlanModel = _case.casePlanModel;

    var casePlanModelContext;
    if (casePlanModel) {
      casePlanModelContext = handleCasePlanModel(casePlanModel, context);
    }

    handleDeferred(deferred);

    forEach(connections, function(d) { d(casePlanModelContext); });

  }

  function handleCasePlanModel(casePlanModel, context) {
    var newCtx = visitIfDi(casePlanModel, context);

    forEach(casePlanModel.exitCriteria, contextual(handleCriterion, newCtx));

    handlePlanFragment(casePlanModel, newCtx);
    handleElementsWithoutParent(casePlanModel, newCtx);

    return newCtx;
  }

  function handleDeferred(deferred) {
    forEach(deferred, function(d) { d(); });
  }

  function handlePlanFragment(planFragment, context) {
    handlePlanItems(planFragment.planItems, context);

    if (is(planFragment, 'cmmn:Stage')) {
      handleStage(planFragment, context);
    }
  }

  function handleStage(stage, context) {
    handlePlanningTable(stage.planningTable, context);
  }

  function handlePlanningTable(planningTable, context) {
    if (planningTable) {
      forEach(planningTable.tableItems, function(tableItem) {
        if (is(tableItem, 'cmmn:DiscretionaryItem')) {
          handleDiscretionaryItem(tableItem, context);
        }
        else if (is(tableItem, 'cmmn:PlanningTable')) {
          handlePlanningTable(tableItem, context);
        }
      });
    }
  }

  function handleDiscretionaryItem(discretionayItem, context) {
    if (isDiscretionaryItemHandled(discretionayItem)) {
      return;
    }

    handledDiscretionaryItem(discretionayItem);
    handleItem(discretionayItem, context);
  }

  function handlePlanItems(planItems, context) {
    forEach(planItems, contextual(handleItem, context));
  }

  function handleItem(item, context) {
    var newCtx = visitIfDi(item, context);

    forEach(item.exitCriteria, contextual(handleCriterion, context));
    forEach(item.entryCriteria, contextual(handleCriterion, context));

    var definitionRef = item.definitionRef;
    if (is(definitionRef, 'cmmn:PlanFragment')) {
      handlePlanFragment(definitionRef, newCtx);
      handleElementsWithoutParent(item, newCtx);
    }
    else if (is(definitionRef, 'cmmn:HumanTask')) {
      handlePlanningTable(definitionRef.planningTable, context);

      var edges = discretionaryConnections[item.id];
      forEach(edges, contextual(handleDiscretionaryConnection, context));
      delete discretionaryConnections[item.id];

    }
  }

  function handleCriterion(criterion, context) {
    deferred.unshift(function() {
      visitIfDi(criterion, context);
    });
  }

  function handleElementsWithoutParent(container, context) {

    if (container.di && container.di.bounds) {
      var elements = getEnclosedElements(elementsWithoutParent, container);

      forEach(elements, function(e) {
        Collections.remove(elementsWithoutParent, e);
        handleElementWithoutParent(e, context);
      });
    }

  }

  function handleElementWithoutParent(element, context) {
    if (is(element, 'cmmn:TextAnnotation')) {
      handleTextAnnotation(element, context);
    }
    else if (is(element, 'cmmn:CaseFileItem')) {
      handleCaseFileItem(element, context);
    }
  }

  function handleCaseFileItem(caseFileItem, context) {
    visitIfDi(caseFileItem, context);
  }

  function handleTextAnnotation(annotation, context) {
    visitIfDi(annotation, context);
  }

  function handleAssociation(association, context) {
    visit(association, context);
  }

  function handleDiscretionaryConnection(connection, context) {
    deferred.push(function() {
      visit(connection, context);
    });
  }

  function getEnclosedElements(elements, container) {
    var bounds = container.di.bounds;
    return filter(elements, function(e) {
      return e.di.bounds.x > bounds.x &&
             e.di.bounds.x < (bounds.x + bounds.width) &&
             e.di.bounds.y > bounds.y &&
             e.di.bounds.y < (bounds.y + bounds.height);
    });
  }

  // API /////////////////

  return {
    handleDefinitions: handleDefinitions
  };
}

module.exports = CmmnTreeWalker;