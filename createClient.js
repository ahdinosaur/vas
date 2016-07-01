var muxrpc = require('muxrpc')
var setIn = require('set-in')

var defaultSerialize = require('./serialize')
var walk = require('./walk')

module.exports = createClient

function createClient (services, config) {
  var manifest = {}

  walk(services, function (service, path) {
    // merge manifest
    setIn(manifest, path, service.manifest)
  })

  var serialize = config.serialize || defaultSerialize

  return muxrpc(manifest, null, serialize)()
}
