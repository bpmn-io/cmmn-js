'use strict';

var TestContainer = require('mocha-test-container-support');

var Viewer = require('../../lib/Viewer');


describe('Viewer', function() {

  var container;

  beforeEach(function() {
      container = TestContainer.get(this);
  });


  function createViewer(xml, done) {
    var viewer = new Viewer({ container: container });

    viewer.importXML(xml, function(err, warnings) {
      done(err, warnings, viewer);
    });
  }


  it('should import simple case', function(done) {
    var xml = require('../fixtures/cmmn/simple.cmmn');
    createViewer(xml, done);
  });


  describe('defaults', function() {

    it('should use <body> as default parent', function(done) {

      var xml = require('../fixtures/cmmn/simple.cmmn');

      var viewer = new Viewer();

      viewer.importXML(xml, function(err, warnings) {

        expect(viewer.container.parentNode).to.equal(document.body);

        done(err, warnings);
      });
    });

  });


  describe('error handling', function() {


    function expectMessage(e, expectedMessage) {

      expect(e).to.be.defined;

      if (expectedMessage instanceof RegExp) {
        expect(e.message).to.match(expectedMessage);
      } else {
        expect(e.message).to.equal(expectedMessage);
      }
    }

    function expectWarnings(warnings, expected) {

      expect(warnings.length).to.equal(expected.length);

      warnings.forEach(function(w, idx) {
        expectMessage(w, expected[idx]);
      });
    }


    it('should handle non-cmmn input', function(done) {

      var xml = 'invalid stuff';

      createViewer(xml, function(err) {

        expect(err).to.be.ok;

        expectMessage(err, /Text data outside of root node./);

        done();
      });
    });


    it('should handle invalid CMMNShape#cmmnElementRef', function(done) {

      var xml = require('../fixtures/cmmn/error/cmmn-shape-no-cmmn-element-ref.cmmn');

      // when
      createViewer(xml, function(err, warnings) {

        // then
        expect(err).to.not.be.ok;

        expectWarnings(warnings, [
          'no cmmnElement referenced in <cmmndi:CMMNShape id="DI_PI_Task_1" />'
        ]);

        done();
      });
    });


    it('should handle missing namespace', function(done) {

      var xml = require('../fixtures/cmmn/error/missing-namespace.cmmn');

      // when
      createViewer(xml, function(err, warnings) {

        // then
        expect(err).to.not.be.ok;

        expectWarnings(warnings, [
          /unparsable content <case> detected/,
          'unresolved reference <CasePlanModel_1>',
          'unresolved reference <PI_Task_1>',
          'no cmmnElement referenced in <cmmndi:CMMNShape id="DI_CasePlanModel_1" />',
          'no cmmnElement referenced in <cmmndi:CMMNShape id="DI_PI_Task_1" />'
        ]);

        done();
      });
    });

  });


  describe('dependency injection', function() {

    it('should be available via di as <cmmnjs>', function(done) {

      var xml = require('../fixtures/cmmn/simple.cmmn');

      createViewer(xml, function(err, warnings, viewer) {

        expect(viewer.get('cmmnjs')).to.equal(viewer);

        done(err);
      });
    });

  });


  describe('export', function() {

    function currentTime() {
      return new Date().getTime();
    }

    function isValid(svg) {
      var expectedStart = '<?xml version="1.0" encoding="utf-8"?>';
      var expectedEnd = '</svg>';

      expect(svg.indexOf(expectedStart)).to.equal(0);
      expect(svg.indexOf(expectedEnd)).to.equal(svg.length - expectedEnd.length);

      // ensure correct rendering of SVG contents
      expect(svg.indexOf('undefined')).to.equal(-1);

      // expect header to be written only once
      expect(svg.indexOf('<svg width="100%" height="100%">')).to.equal(-1);
      expect(svg.indexOf('<g class="viewport"')).to.equal(-1);

      // TODO: make matcher
      return true;
    }


    it('should export svg', function(done) {

      // given
      var xml = require('../fixtures/cmmn/empty-definitions.cmmn');

      createViewer(xml, function(err, warnings, viewer) {

        if (err) {
          return done(err);
        }

        // when
        viewer.saveSVG(function(err, svg) {

          if (err) {
            return done(err);
          }

          // then
          expect(isValid(svg)).to.be.true;

          done();
        });
      });
    });


    it('should export complex svg', function(done) {

      // given
      var xml = require('../fixtures/cmmn/complex.cmmn');

      createViewer(xml, function(err, warnings, viewer) {

        if (err) {
          return done(err);
        }

        var time = currentTime();

        // when
        viewer.saveSVG(function(err, svg) {

          if (err) {
            return done(err);
          }

          // then
          expect(isValid(svg)).to.be.true;

          // no svg export should not take too long
          expect(currentTime() - time).to.be.below(1000);

          done();
        });
      });
    });


    it('should remove outer-makers on export', function(done) {

      // given
      var xml = require('../fixtures/cmmn/simple.cmmn');
      function appendTestRect(svgDoc) {
        var rect = document.createElementNS(svgDoc.namespaceURI, 'rect');
        rect.setAttribute('class', 'outer-bound-marker');
        rect.setAttribute('width', 500);
        rect.setAttribute('height', 500);
        rect.setAttribute('x', 10000);
        rect.setAttribute('y', 10000);
        svgDoc.appendChild(rect);
      }

      createViewer(xml, function(err, warnings, viewer) {

        if (err) {
          return done(err);
        }

        var svgDoc = viewer.container.childNodes[1].childNodes[1];



        appendTestRect(svgDoc);
        appendTestRect(svgDoc);

        expect(svgDoc.querySelectorAll('.outer-bound-marker')).to.be.defined;

        // when
        viewer.saveSVG(function(err, svg) {

          if (err) {
            return done(err);
          }

          var svgDoc = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svgDoc.innerHTML = svg;

          // then
          expect(isValid(svg)).to.be.true;
          expect(svgDoc.querySelector('.outer-bound-marker')).to.be.null;

          done();
        });
      });
    });

  });


  describe('creation', function() {

    var testModules = [
      { logger: [ 'type', function() { this.called = true; } ] }
    ];

    // given
    var xml = require('../fixtures/cmmn/empty-definitions.cmmn');

    var viewer;

    afterEach(function() {
      viewer.destroy();
    });


    it('should override default modules', function(done) {

      // given
      viewer = new Viewer({ container: container, modules: testModules });

      // when
      viewer.importXML(xml, function(err) {

        // then
        expect(err.message).to.equal('No provider for "cmmnImporter"! (Resolving: cmmnImporter)');
        done();
      });

    });


    it('should add module to default modules', function(done) {

      // given
      viewer = new Viewer({ container: container, additionalModules: testModules });

      // when
      viewer.importXML(xml, function(err) {

        // then
        var logger = viewer.get('logger');
        expect(logger.called).to.be.true;

        done(err);
      });

    });


    it('should use custom size and position', function() {

      // when
      viewer = new Viewer({
        container: container,
        width: 200,
        height: 100,
        position: 'fixed'
      });

      // then
      expect(viewer.container.style.position).to.equal('fixed');
      expect(viewer.container.style.width).to.equal('200px');
      expect(viewer.container.style.height).to.equal('100px');
    });

  });


  describe('#destroy', function() {

    it('should remove traces in document tree', function() {

      // given
      var viewer = new Viewer({
        container: container
      });

      // when
      viewer.destroy();

      // then
      expect(viewer.container.parentNode).to.not.be.ok;
    });

  });

});
