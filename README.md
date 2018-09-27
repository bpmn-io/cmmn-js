# cmmn-js - CMMN 1.1 for the web

[![Build Status](https://travis-ci.org/bpmn-io/cmmn-js.svg?branch=master)](https://travis-ci.org/bpmn-io/cmmn-js)

View and edit CMMN 1.1 diagrams in the browser.


## Installation

Use the library [pre-packaged](https://github.com/bpmn-io/cmmn-js-examples/tree/master/pre-packaged)
or include it [via npm](https://github.com/bpmn-io/cmmn-js-examples/tree/master/bundling)
into your node-style web-application.

## Usage

To get started, create a [cmmn-js](https://github.com/bpmn-io/cmmn-js) instance
and render [CMMN 1.1 diagrams](http://www.omg.org/spec/CMMN/1.1/) in the browser:

```javascript
var xml; // my CMMN 1.1 xml
var viewer = new CmmnJS({
  container: 'body'
});

viewer.importXML(xml, function(err) {

  if (err) {
    console.log('error rendering', err);
  } else {
    console.log('rendered');
  }
});
```

Checkout our [examples](https://github.com/bpmn-io/cmmn-js-examples) for many
more supported usage scenarios.


### Dynamic Attach/Detach

You may attach or detach the viewer dynamically to any element on the page, too:

```javascript
var viewer = new CmmnJS();

// attach it to some element
viewer.attachTo('#container');

// detach the panel
viewer.detach();
```


## Resources

*   [Demo](http://demo.bpmn.io/cmmn)
*   [Issues](https://github.com/bpmn-io/cmmn-js/issues)
*   [Examples](https://github.com/bpmn-io/cmmn-js-examples)
*   [Forum](https://forum.bpmn.io)


## Building the Project

Perform the following steps to build the library, including running all tests:

```
cd cmmn-js
npm install
npm run all
```

You may need to perform [additional project setup](./docs/project/SETUP.md) when
building the latest development snapshot.

Please checkout our [contributing guidelines](./.github/CONTRIBUTING.md) if you plan to
file an issue or pull request.


## Related

cmmn-js builds on top of a few additional powerful tools:

* [cmmn-moddle](https://github.com/bpmn-io/cmmn-moddle): Read / write support for CMMN 1.1 XML in the browsers
* [diagram-js](https://github.com/bpmn-io/diagram-js): Diagram rendering and editing toolkit


## License

Use under the terms of the [bpmn.io license](http://bpmn.io/license).
