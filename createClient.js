var muxrpc = require('muxrpc')
var setIn = require('set-in')

var defaultSerialize = require('./serialize')

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

function walkApi (api, cb, path) {
  path = path || []
  Object.keys(api).forEach(function (name) {
    var service = api[name]
    var servicePath = path.concat([name])
    cb(service, servicePath)
    if (service.api) {
      walkApi(api, cb, servicePath)
    }
  })
}
