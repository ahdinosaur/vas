const muxrpc = require('muxrpc')
const setIn = require('set-in')
const defined = require('defined')

const defaultSerialize = require('./serialize')
const walk = require('./walk')

module.exports = createServer

function createServer (services, config, options) {
  options = defined(options, {})

  const serialize = defined(options.serialize, defaultSerialize)

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

  function createStream () {
    return createRpc().createStream()
  }

  function createRpc () {
    const Rpc = muxrpc(null, manifest, serialize)
    return Rpc(methods, permissions)
  }
}
