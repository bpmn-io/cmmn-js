'use strict';


describe('cmmn-navigated-viewer', function() {

  it('should expose globals', function() {

    var CmmnJS = window.CmmnJS;

    // then
    expect(CmmnJS).to.exist;
    expect(new CmmnJS()).to.exist;
  });


  it('should import initial diagram', function(done) {

    var CmmnJS = window.CmmnJS;

    // then
    /* global testImport */
    testImport(CmmnJS, done);
  });

});