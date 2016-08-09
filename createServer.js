const muxrpc = require('muxrpc')
const setIn = require('set-in')
const getIn = require('get-in')
const defined = require('defined')

const defaultSerialize = require('./serialize')
const walk = require('./walk')

module.exports = createServer

function createServer (services, config, options) {
  services = defined(services, [])
  config = defined(config, {})
  options = defined(options, {})

  const serialize = defined(options.serialize, defaultSerialize)

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
    return perm != null ? perm.apply(this, args) : null
  }
}

function defaultAuthenticate (req, cb) {
  cb(null, null)
}
