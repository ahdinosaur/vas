const muxrpc = require('muxrpc')
const setIn = require('set-in')

const serialize = require('./serialize')
const walk = require('./walk')

module.exports = createServer

function createServer (services, config) {
  var manifest = {}
  var permissions = {}
  var methods = {}

  walk(services, function (service, path) {
    // merge manifest
    setIn(manifest, path, service.manifest)
    // merge permissions
    setIn(permissions, path, service.permissions)
    // merge methods by calling service.init(service, config)
    setIn(methods, path, service.init && service.init(service, config))
  })

  return Object.assign({ createStream }, methods)

  function createStream() {
    return createRpc().createStream()
  }

  function createRpc () {
    var Rpc = muxrpc(null, manifest, serialize)
    return Rpc(methods, permissions)
  }
}

