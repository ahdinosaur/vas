const setIn = require('set-in')
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
}

function defaultAuthenticate (req, cb) {
  cb(null, null)
}
