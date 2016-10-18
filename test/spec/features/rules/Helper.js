'use strict';

var TestHelper = require('../../../TestHelper');

function expectCanDrop(element, target, expectedResult) {

  var result;

  TestHelper.getCmmnJs().invoke(function(elementRegistry, cmmnRules) {

    element = elementRegistry.get(element);
    target = elementRegistry.get(target);

    expect(element).to.exist;
    expect(target).to.exist;

    result = cmmnRules.canDrop(element, target);
  });

  expect(result).to.eql(expectedResult);
}

module.exports.expectCanDrop = expectCanDrop;

function expectCanResize(element, bounds, expectedResult) {

  var result;

  TestHelper.getCmmnJs().invoke(function(elementRegistry, cmmnRules) {

    element = elementRegistry.get(element);

    expect(element).to.exist;

    result = cmmnRules.canResize(element, bounds);
  });

  expect(result).to.eql(expectedResult);
}

module.exports.expectCanResize = expectCanResize;


function expectCanConnect(source, target, rules) {

  var results = {};

  TestHelper.getCmmnJs().invoke(function(elementRegistry, cmmnRules) {

    source = elementRegistry.get(source);
    target = elementRegistry.get(target);

    expect(source).to.exist;
    expect(target).to.exist;

    if ('discretionaryConnection' in rules) {
      results.discretionaryConnection = cmmnRules.canConnectDiscretionaryConnection(source, target);
    }

    if ('association' in rules) {
      results.association = cmmnRules.canConnectAssociation(source, target);
    }

    if ('caseFileItemOnPart' in rules) {
      results.caseFileItemOnPart = cmmnRules.canConnectCaseFileItemOnPartConnection(source, target);
    }

    if ('planItemOnPart' in rules) {
      results.planItemOnPart = cmmnRules.canConnectPlanItemOnPartConnection(source, target);
    }

  });

  expect(results).to.eql(rules);
}

module.exports.expectCanConnect = expectCanConnect;


function expectCanMove(elements, target, rules) {

  var results = {};

  TestHelper.getCmmnJs().invoke(function(elementRegistry, cmmnRules) {

    target = elementRegistry.get(target);

    if ('attach' in rules) {
      results.attach = cmmnRules.canAttach(elements, target);
    }

    if ('move' in rules) {
      results.move = cmmnRules.canMove(elements, target);
    }
  });

  expect(results).to.eql(rules);
}

module.exports.expectCanMove = expectCanMove;


function expectCanReplace(elements, target, rules) {

  var results;

  TestHelper.getCmmnJs().invoke(function(elementRegistry, cmmnRules) {

    target = elementRegistry.get(target);

    results = cmmnRules.canReplace(elements, target);

    if (results !== false) {
      results = results.replacements[0];
    }

  });

  expect(results).to.eql(rules);
}

module.exports.expectCanReplace = expectCanReplace;


function expectCanReplaceConnectionEnd(source, target, end, rules) {

  var results;

  TestHelper.getCmmnJs().invoke(function(elementRegistry, cmmnRules) {

    source = elementRegistry.get(source);
    target = elementRegistry.get(target);

    results = cmmnRules.canReplaceConnectionEnd(source, target, end);

  });

  expect(results).to.eql(rules);
}

module.exports.expectCanReplaceConnectionEnd = expectCanReplaceConnectionEnd;


function expectCanRemove(elements, expectedElements) {

  var elementsToRemove = [];

  TestHelper.getCmmnJs().invoke(function(elementRegistry, cmmnRules) {

    if (expectedElements) {
      elementsToRemove = cmmnRules.canRemove(elements);
    }

  });

  expect(elementsToRemove).to.eql(expectedElements);
}

module.exports.expectCanRemove = expectCanRemove;
