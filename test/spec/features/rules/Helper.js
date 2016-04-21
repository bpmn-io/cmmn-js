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

  });

  expect(results).to.eql(rules);
}

module.exports.expectCanConnect = expectCanConnect;