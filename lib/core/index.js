module.exports = {
  __depends__: [
    require('../draw'),
    require('../import')
  ],
  itemRegistry: [ 'type', require('./ItemRegistry') ]
};