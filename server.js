const setProp = require('@f/set-prop')
const defined = require('defined')

const walk = require('./walk')

module.exports = createServer

function createServer (services, config, options) {
  services = defined(services, [])
  config = defined(config, {})
  options = defined(options, {})

  var server = {
    manifest: {},
    permissions: {},
    methods: {},
    handlers: []
  }

  walk(services, function (service, path) {
    // merge manifest
    server.manifest = setProp(path, server.manifest, service.manifest)
    // merge methods by calling service.init(service, config)
    server.methods = setProp(path, server.methods, service.methods && service.methods(server, config))
    // merge permissions
    server.permission = setProp(path, server.permissions, service.permissions && service.permissions(server, config))
    // merge http handlers
    if (service.handlers) server.handlers = server.handlers.concat(service.handlers(server, config))
    if (!server.authenticate && service.authenticate) server.authenticate = service.authenticate(server, config)
  })

  if (!server.authenticate) server.authenticate = defaultAuthenticate

  return server
}

function defaultAuthenticate (req, cb) {
  cb(null, null)
}
