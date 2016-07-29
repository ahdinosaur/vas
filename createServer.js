const muxrpc = require('muxrpc')
const setIn = require('set-in')
const getIn = require('get-in')

const serialize = require('./serialize')
const walk = require('./walk')

module.exports = createServer

function createServer (services, config) {
  var server = {
    manifest: {},
    permissions: {},
    methods: {},
    createStream
  }

  walk(services, function (service, path) {
    // merge manifest
    setIn(server.manifest, path, service.manifest)
    // BACK COMPAT
    if (!service.methods && service.init) service.methods = service.init
    // merge methods by calling service.init(service, config)
    setIn(server.methods, path, service.methods && service.methods(server, config))
    // merge permissions
    setIn(server.permissions, path, service.permissions && service.permissions(server, config))
  })

  return server

  function createStream (id) {
    return createRpc(id).stream
  }

  function createRpc (id) {
    return muxrpc(server.manifest, server.manifest, server.methods, id, permission, serialize)
  }

  function permission (name, args) {
    const perm = getIn(server.permissions, name)
    return perm != null ? perm(...args) : null
  }
}
