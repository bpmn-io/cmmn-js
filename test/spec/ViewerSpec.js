'use strict';

var TestContainer = require('mocha-test-container-support');

var Diagram = require('diagram-js/lib/Diagram').default;

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

    // when
    createViewer(xml, function(err, warnings, viewer) {

      // then
      expect(err).not.to.exist;
      expect(warnings).to.be.empty;

      var definitions = viewer.getDefinitions();

      expect(definitions).to.exist;
      expect(definitions).to.eql(viewer._definitions);

      done();
    });
  });


  it('should re-import simple case', function(done) {

    var xml = require('../fixtures/cmmn/simple.cmmn');

    // given
    createViewer(xml, function(err, warnings, viewer) {

      if (err) {
        return done(err);
      }

      // when
      // mimic re-import of same diagram
      viewer.importXML(xml, function(err, warnings) {

        if (err) {
          return done(err);
        }

        // then
        expect(warnings.length).to.equal(0);

        done();
      });

    });
  });


  it('should be instance of Diagram', function() {

    // when
    var viewer = new Viewer({ container: container });

    // then
    expect(viewer).to.be.instanceof(Diagram);
  });


  describe('defaults', function() {

    it('should not attach per default', function(done) {

      var xml = require('../fixtures/cmmn/simple.cmmn');

      var viewer = new Viewer({});

      viewer.importXML(xml, function(err, warnings) {

        expect(viewer._container.parentNode).not.to.exist;

        done(err, warnings);
      });
    });

  });


  describe('error handling', function() {


    function expectMessage(e, expectedMessage) {

      expect(e).to.exist;

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

        expectMessage(err, /missing start tag/);

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
        expect(err).to.exist;
        expect(err.message).to.match(/failed to parse document as <cmmn:Definitions>/);

        expectWarnings(warnings, [
          /unparsable content <definitions> detected/
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


    it('should allow Diagram#get before import', function() {

      // when
      var viewer = new Viewer({ container: container });

      // then
      var eventBus = viewer.get('eventBus');

      expect(eventBus).to.exist;
    });


    it('should keep references to services across re-import', function(done) {

      // given
      var someXML = require('../fixtures/cmmn/simple.cmmn'),
          otherXML = require('../fixtures/cmmn/empty-definitions.cmmn');

      var viewer = new Viewer({ container: container });

      var eventBus = viewer.get('eventBus'),
          canvas = viewer.get('canvas');

      // when
      viewer.importXML(someXML, function() {

        // then
        expect(viewer.get('canvas')).to.equal(canvas);
        expect(viewer.get('eventBus')).to.equal(eventBus);

        viewer.importXML(otherXML, function() {

          // then
          expect(viewer.get('canvas')).to.equal(canvas);
          expect(viewer.get('eventBus')).to.equal(eventBus);

          done();
        });
      });

    });
  });


  describe('#saveXML', function() {

    it('should export XML', function(done) {

      // given
      var xml = require('../fixtures/cmmn/simple.cmmn');

      createViewer(xml, function(err, warnings, viewer) {

        // when
        viewer.saveXML({ format: true }, function(err, xml) {

          // then
          expect(xml).to.contain('<?xml version="1.0" encoding="UTF-8"?>');
          expect(xml).to.contain('<cmmn:definitions');
          expect(xml).to.contain('  ');

          done();
        });
      });

    });


    it('should emit <saveXML.*> events', function(done) {

      var xml = require('../fixtures/cmmn/simple.cmmn');

      createViewer(xml, function(err, warnings, viewer) {

        var events = [];

        viewer.on([
          'saveXML.start',
          'saveXML.serialized',
          'saveXML.done'
        ], function(e) {
          // log event type + event arguments
          events.push([
            e.type,
            Object.keys(e).filter(function(key) {
              return key !== 'type';
            })
          ]);
        });

        viewer.importXML(xml, function(err) {

          // when
          viewer.saveXML(function(err) {
            // then
            console.log('events', events);
            expect(events).to.eql([
              [ 'saveXML.start', [ 'definitions' ] ],
              [ 'saveXML.serialized', ['error', 'xml' ] ],
              [ 'saveXML.done', ['error', 'xml' ] ]
            ]);

            done(err);
          });
        });
      });
    });

  });


  describe('#saveSVG', function() {

    function currentTime() {
      return new Date().getTime();
    }

    function validSVG(svg) {
      var expectedStart = '<?xml version="1.0" encoding="utf-8"?>';
      var expectedEnd = '</svg>';

      expect(svg.indexOf(expectedStart)).to.equal(0);
      expect(svg.indexOf(expectedEnd)).to.equal(svg.length - expectedEnd.length);

      // ensure correct rendering of SVG contents
      expect(svg.indexOf('undefined')).to.equal(-1);

      // expect header to be written only once
      expect(svg.indexOf('<svg width="100%" height="100%">')).to.equal(-1);
      expect(svg.indexOf('<g class="viewport"')).to.equal(-1);

      var parser = new DOMParser();
      var svgNode = parser.parseFromString(svg, 'image/svg+xml');

      // [comment, <!DOCTYPE svg>, svg]
      expect(svgNode.childNodes).to.have.length(3);

      // no error body
      expect(svgNode.body).not.to.exist;

      // FIXME(nre): make matcher
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
          expect(validSVG(svg)).to.be.true;

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
          expect(validSVG(svg)).to.be.true;

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

        var svgDoc = viewer._container.childNodes[1].childNodes[1];



        appendTestRect(svgDoc);
        appendTestRect(svgDoc);

        expect(svgDoc.querySelectorAll('.outer-bound-marker')).to.exist;

        // when
        viewer.saveSVG(function(err, svg) {

          if (err) {
            return done(err);
          }

          var svgDoc = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svgDoc.innerHTML = svg;

          // then
          expect(validSVG(svg)).to.be.true;
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
      expect(viewer._container.style.position).to.equal('fixed');
      expect(viewer._container.style.width).to.equal('200px');
      expect(viewer._container.style.height).to.equal('100px');
    });

  });



  describe('#importXML', function() {

    it('should emit <import.*> events', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var xml = require('../fixtures/cmmn/simple.cmmn');

      var events = [];

      viewer.on([
        'import.parse.start',
        'import.parse.complete',
        'import.render.start',
        'import.render.complete',
        'import.done'
      ], function(e) {
        // log event type + event arguments
        events.push([
          e.type,
          Object.keys(e).filter(function(key) {
            return key !== 'type';
          })
        ]);
      });

      // when
      viewer.importXML(xml, function(err) {

        // then
        expect(events).to.eql([
          [ 'import.parse.start', [ 'xml' ] ],
          [ 'import.parse.complete', ['error', 'definitions', 'context' ] ],
          [ 'import.render.start', [ 'definitions' ] ],
          [ 'import.render.complete', [ 'error', 'warnings' ] ],
          [ 'import.done', [ 'error', 'warnings' ] ]
        ]);

        done(err);
      });
    });


    it('should work without callback', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var xml = require('../fixtures/cmmn/simple.cmmn');

      // when
      viewer.importXML(xml);

      // then
      viewer.on('import.done', function(event) {
        done();
      });
    });

  });


  describe('#on', function() {

    it('should fire with given three', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var xml = require('../fixtures/cmmn/simple.cmmn');

      // when
      viewer.on('foo', 1000, function() {
        return 'bar';
      }, viewer);

      // then
      viewer.importXML(xml, function(err) {
        var eventBus = viewer.get('eventBus');

        var result = eventBus.fire('foo');

        expect(result).to.equal('bar');

        done();
      });

    });

  });


  describe('#off', function() {

    var xml = require('../fixtures/cmmn/simple.cmmn');

    it('should remove listener permanently', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var handler = function() {
        return 'bar';
      };

      viewer.on('foo', 1000, handler);

      // when
      viewer.off('foo');

      // then
      viewer.importXML(xml, function(err) {
        var eventBus = viewer.get('eventBus');

        var result = eventBus.fire('foo');

        expect(result).not.to.exist;

        done();
      });

    });


    it('should remove listener on existing diagram instance', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var handler = function() {
        return 'bar';
      };

      viewer.on('foo', 1000, handler);

      // when
      viewer.importXML(xml, function(err) {
        var eventBus = viewer.get('eventBus');

        // when
        viewer.off('foo', handler);

        var result = eventBus.fire('foo');

        expect(result).not.to.exist;

        done();
      });

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
      expect(viewer._container.parentNode).not.to.exist;
    });


    it('should clear item registry', function() {

      var xml = require('../fixtures/cmmn/simple.cmmn');

      // given
      createViewer(xml, function(err, warnings, viewer) {

        var itemRegistry = viewer.get('itemRegistry');

        // assume
        expect(itemRegistry.get('CasePlanModel_1')).to.exist;
        expect(itemRegistry.getReferences('CasePlanModel_1')).to.have.length(1);

        // when
        viewer.destroy();

        // then
        expect(itemRegistry.get('CasePlanModel_1')).not.to.exist;
        expect(itemRegistry.getReferences('CasePlanModel_1')).to.be.empty;

      });

    });

  });


  describe('#clear', function() {

    it('should clear item registry', function() {

      var xml = require('../fixtures/cmmn/simple.cmmn');

      // given
      createViewer(xml, function(err, warnings, viewer) {

        var itemRegistry = viewer.get('itemRegistry');

        // assume
        expect(itemRegistry.get('CasePlanModel_1')).to.exist;
        expect(itemRegistry.getReferences('CasePlanModel_1')).to.have.length(1);

        // when
        viewer.clear();

        // then
        expect(itemRegistry.get('CasePlanModel_1')).not.to.exist;
        expect(itemRegistry.getReferences('CasePlanModel_1')).to.be.empty;

      });

    });

  });


  describe('#attachTo', function() {

    it('should attach the viewer', function(done) {

      var xml = require('../fixtures/cmmn/simple.cmmn');

      var viewer = new Viewer();

      viewer.importXML(xml, function(err, warnings) {

        // assume
        expect(viewer._container.parentNode).not.to.exist;

        /* global sinon */
        var resizedSpy = sinon.spy();

        viewer.on('canvas.resized', resizedSpy);

        // when
        viewer.attachTo(container);

        // then
        expect(viewer._container.parentNode).to.equal(container);

        // should trigger resized
        expect(resizedSpy).to.have.been.called;

        done(err, warnings);
      });
    });

  });


  describe('#detach', function() {

    it('should detach the viewer', function(done) {

      var xml = require('../fixtures/cmmn/simple.cmmn');

      var viewer = new Viewer({ container: container });

      viewer.importXML(xml, function(err, warnings) {

        // assume
        expect(viewer._container.parentNode).to.equal(container);

        // when
        viewer.detach();

        // then
        expect(viewer._container.parentNode).not.to.exist;

        done(err, warnings);
      });
    });

  });

});
