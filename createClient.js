var muxrpc = require('muxrpc')
var setIn = require('set-in')

var defaultSerialize = require('./serialize')
var walkApi = require('./walkApi')

module.exports = createClient

function createClient (api, config) {
  var manifest = {}

  walkApi(api, function (service, path) {
    // merge manifest
    setIn(manifest, path, service.manifest)
  })

  const serialize = config.serialize || defaultSerialize

  return muxrpc(manifest, null, serialize)()
}

