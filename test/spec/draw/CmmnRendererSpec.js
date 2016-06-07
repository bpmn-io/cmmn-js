'use strict';

var coreModule = require('../../../lib/core');

/* global bootstrapViewer */

var testModules = [ coreModule ];


function bootstrap(xml, done) {
  bootstrapViewer(xml, { modules : testModules })(done);
}

describe('draw - cmmn renderer', function() {

  describe('case plan model', function() {

    it('should render case plan model', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/case-plan-model.cmmn');
      bootstrap(xml, done);
    });

  });


  describe('stage', function() {

    it('should render expanded stage', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/expanded-stage.cmmn');
      bootstrap(xml, done);
    });


    it('should render expanded discretionary stage', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/expanded-discretionary-stage.cmmn');
      bootstrap(xml, done);
    });


    it('should render collapsed stage', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/collapsed-stage.cmmn');
      bootstrap(xml, done);
    });


    it('should render collapsed discretionary stage', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/collapsed-discretionary-stage.cmmn');
      bootstrap(xml, done);
    });

  });

  describe('plan fragment', function() {

    it('should render expanded plan fragment', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/expanded-plan-fragment.cmmn');
      bootstrap(xml, done);
    });


    it('should render collapsed plan fragment', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/collapsed-plan-fragment.cmmn');
      bootstrap(xml, done);
    });

  });

  describe('task types', function() {

    it('should render untyped task', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/untyped-task.cmmn');
      bootstrap(xml, done);
    });

    it('should render discretionary untyped task', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/discretionary-untyped-task.cmmn');
      bootstrap(xml, done);
    });


    it('should render human task', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/human-task.cmmn');
      bootstrap(xml, done);
    });


    it('should render discretionary human task', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/discretionary-human-task.cmmn');
      bootstrap(xml, done);
    });


    it('should render manual task', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/manual-task.cmmn');
      bootstrap(xml, done);
    });


    it('should render discretionary manual task', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/discretionary-manual-task.cmmn');
      bootstrap(xml, done);
    });


    it('should render process task', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/process-task.cmmn');
      bootstrap(xml, done);
    });


    it('should render discretionary process task', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/discretionary-process-task.cmmn');
      bootstrap(xml, done);
    });


    it('should render case task', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/case-task.cmmn');
      bootstrap(xml, done);
    });


    it('should render discretionary case task', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/discretionary-case-task.cmmn');
      bootstrap(xml, done);
    });


    it('should render decision task', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/decision-task.cmmn');
      bootstrap(xml, done);
    });


    it('should render discretionary decision task', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/discretionary-decision-task.cmmn');
      bootstrap(xml, done);
    });

  });


  describe('event listener', function() {

    it('should render untyped event listener', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/untyped-event-listener.cmmn');
      bootstrap(xml, done);
    });


    it('should render discretionary untyped event listener', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/discretionary-untyped-event-listener.cmmn');
      bootstrap(xml, done);
    });


    it('should render user event listener', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/user-event-listener.cmmn');
      bootstrap(xml, done);
    });


    it('should render discretionary user event listener', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/discretionary-user-event-listener.cmmn');
      bootstrap(xml, done);
    });


    it('should render timer event listener', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/timer-event-listener.cmmn');
      bootstrap(xml, done);
    });


    it('should render discretionary timer event listener', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/discretionary-timer-event-listener.cmmn');
      bootstrap(xml, done);
    });

  });


  describe('milestone', function() {

    it('should render milestone', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/milestone.cmmn');
      bootstrap(xml, done);
    });


    it('should render discretionary milestone', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/discretionary-milestone.cmmn');
      bootstrap(xml, done);
    });

  });


  describe('sentry', function() {

    it('should render entry criterion', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/entry-criterion.cmmn');
      bootstrap(xml, done);
    });


    it('should render exit criterion', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/exit-criterion.cmmn');
      bootstrap(xml, done);
    });


    it('should render exit criterion on case plan model', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/exit-criterion-on-case-plan-model.cmmn');
      bootstrap(xml, done);
    });

  });

  describe('case file item', function() {

    it('should render case file item', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/case-file-item.cmmn');
      bootstrap(xml, done);
    });

  });


  describe('on part', function() {

    it('should render plan item on part', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/plan-item-on-part.cmmn');
      bootstrap(xml, done);
    });


    it('should render plan item on part references exit criterion', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/plan-item-on-part-references-exit-criterion.cmmn');
      bootstrap(xml, done);
    });


    it('should render case file item on part', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/case-file-item-on-part.cmmn');
      bootstrap(xml, done);
    });

  });


  describe('connection', function() {

    it('should render connection', function(done) {
      var xml = require('../../fixtures/cmmn/renderer/connection.cmmn');
      bootstrap(xml, done);
    });

  });

});
