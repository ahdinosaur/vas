var setIn = require('set-in')
var defined = require('defined')

var walk = require('./walk')

module.exports = Server

function Server (services, config) {
  services = defined(services, [])
  config = defined(config, {})

  var server = {
    manifest: {},
    permissions: {},
    methods: {},
    handlers: []
  }

  walk(services, function (service, path) {
    // merge manifest
    setIn(server.manifest, path, service.manifest)
    // merge methods by calling service.init(service, config)
    setIn(server.methods, path, service.methods && service.methods(server, config))
    // merge permissions
    setIn(server.permissions, path, service.permissions && service.permissions(server, config))
    // merge http handlers
    if (service.handler) server.handlers.push(service.handler(server, config))
    else if (service.handlers) server.handlers = server.handlers.concat(service.handlers(server, config))
    // get first authenticate, if any
    if (!server.authenticate && service.authenticate) server.authenticate = service.authenticate(server, config)
  })

  if (!server.authenticate) server.authenticate = defaultAuthenticate

  return server
}

function defaultAuthenticate (req, cb) {
  cb(null, null)
}
