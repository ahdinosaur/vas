var muxrpc = require('muxrpc')
var setIn = require('set-in')

var serialize = require('./serialize')
var walkApi = require('./walkApi')

module.exports = createServer

function createServer (api, config) {

  var manifest = {}
  var permissions = {}
  var local = {}

  walkApi(api, function (service, path) {
    // merge manifest
    setIn(manifest, path, service.manifest)
    // merge permissions
    setIn(permissions, path, service.permissions)
    // merge local by calling service.init(api, config)
    setIn(local, path, service.init(api, config))
  })
  return {
    createRpc,
    createStream
  }

  function createRpc () {
    var Rpc = muxrpc(null, manifest, serialize)
    return Rpc(local, permissions)
  }

  function createStream() {
    return createRpc().createStream()
  }
}

