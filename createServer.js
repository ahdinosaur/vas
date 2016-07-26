const muxrpc = require('muxrpc')
const setIn = require('set-in')

const serialize = require('./serialize')
const walk = require('./walk')

module.exports = createServer

function createServer (services, config) {
  const manifest = {}
  const permissions = {}
  const methods = {}

  walk(services, function (service, path) {
    // merge manifest
    setIn(manifest, path, service.manifest)
    // merge permissions
    setIn(permissions, path, service.permissions)
    // merge methods by calling service.init(service, config)
    setIn(methods, path, service.init && service.init(service, config))
  })

  return Object.assign({
    manifest,
    createStream
  }, methods)

  function createStream () {
    return createRpc().createStream()
  }

  function createRpc () {
    const Rpc = muxrpc(null, manifest, serialize)
    return Rpc(methods, permissions)
  }
}
