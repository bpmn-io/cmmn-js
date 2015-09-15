# cmmn-js - CMMN 1.1 for the web

[![Build Status](https://travis-ci.org/bpmn-io/cmmn-js.svg?branch=master)](https://travis-ci.org/bpmn-io/cmmn-js)

[cmmn-js](https://github.com/bpmn-io/cmmn-js) is the CMMN 1.1 diagram rendering toolkit that powers [bpmn.io](http://bpmn.io).


> the project is still in an early stage. Documentation may be missing and examples may be broken.


## Usage

Get the library via [npm](http://npmjs.org) or [bower](http://bower.io) and use it in your web applications to display [CMMN 1.1 diagrams](http://www.omg.org/spec/CMMN/).


```javascript
var CmmnViewer = require('cmmn-js');

var xml; // my CMMN 1.1 xml
var viewer = new CmmnViewer({ container: 'body' });

viewer.importXML(xml, function(err) {

  if (err) {
    console.log('error rendering', err);
  } else {
    console.log('rendered');
  }
});
```


## Install cmmn-js

### via bower

```
bower install cmmn-js
```

Make sure to include the library + all dependencies into the website.

### via npm

```
npm install --save cmmn-js
```

Make sure you use [browserify](http://browserify.org) or the like to bundle your project and cmmn-js for the browser.


## Resources

*   [Issues](https://github.com/bpmn-io/cmmn-js/issues)


## Tools

cmmn-js builds on top of a few additional powerful tools

* [cmmn-moddle](https://github.com/bpmn-io/cmmn-moddle): Read / write support for CMMN 1.1 XML in the browsers
* [diagram-js](https://github.com/bpmn-io/diagram-js): Diagram rendering and editing toolkit


## Building the Project

As long as the project is in alpha stage, you must make sure you setup the whole development environment, including a number of [project dependencies](https://github.com/bpmn-io) according to [our development setup](https://github.com/bpmn-io/cmmn-js/blob/master/docs/project/SETUP.md).


## License

Use under the terms of the [cmmn-js license](http://bpmn.io/license).
