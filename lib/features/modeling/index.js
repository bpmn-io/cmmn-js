module.exports = {
  __init__: [ 'modeling', 'cmmnUpdater' ],
  __depends__: [
    require('./behavior'),
    require('../ordering'),
    require('../replace'),
    require('../rules'),
    require('diagram-js/lib/command'),
    require('diagram-js/lib/features/selection'),
    require('diagram-js/lib/features/attach-support'),
    require('diagram-js/lib/features/change-support')
  ],
  cmmnFactory: [ 'type', require('./CmmnFactory') ],
  cmmnUpdater: [ 'type', require('./CmmnUpdater') ],
  elementFactory: [ 'type', require('./ElementFactory') ],
  modeling: [ 'type', require('./Modeling') ],
  layouter: [ 'type', require('./CmmnLayouter') ],
  connectionDocking: [ 'type', require('diagram-js/lib/layout/CroppingConnectionDocking') ]
};
