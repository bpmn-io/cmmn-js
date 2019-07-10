var CmmnConnectSnapping = require('./CmmnConnectSnapping');
var CmmnCreateMoveSnapping = require('./CmmnCreateMoveSnapping');
var CmmnResizeSnapping = require('./CmmnResizeSnapping');
var SnappingModule = require('diagram-js/lib/features/snapping').default;


module.exports = {
  __depends__: [ SnappingModule ],
  __init__: [
    'connectSnapping',
    'createMoveSnapping',
    'resizeSnapping'
  ],
  connectSnapping: [ 'type', CmmnConnectSnapping ],
  createMoveSnapping: [ 'type', CmmnCreateMoveSnapping],
  resizeSnapping: [ 'type', CmmnResizeSnapping ]
};