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
