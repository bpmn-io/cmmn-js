'use strict';


describe('cmmn-modeler', function() {

  it('should expose globals', function() {

    var CmmnJS = window.CmmnJS;

    // then
    expect(CmmnJS).to.exist;
    expect(new CmmnJS()).to.exist;
  });


  it('should expose Viewer and NavigatedViewer', function() {

    var CmmnJS = window.CmmnJS;

    // then
    expect(CmmnJS.NavigatedViewer).to.exist;
    expect(new CmmnJS.NavigatedViewer()).to.exist;

    expect(CmmnJS.Viewer).to.exist;
    expect(new CmmnJS.Viewer()).to.exist;
  });


  it('should import initial diagram', function(done) {

    var CmmnJS = window.CmmnJS;

    // then
    /* global testImport */
    testImport(CmmnJS, done);
  });

});