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
    handlers: [],
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
    // merge http handlers
    if (service.handlers) server.handlers = server.handlers.concat(service.handlers(server, config))
    if (!server.authenticate && service.authenticate) server.authenticate = service.authenticate(server, config)
  })

  if (!server.authenticate) server.authenticate = defaultAuthenticate

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

function defaultAuthenticate (req, cb) {
  cb(null, null)
}
