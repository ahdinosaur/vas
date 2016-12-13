const defaultAuthenticate = require('./authenticate')

module.exports = Service

function Service (definitions = [], config = {}) {
  var service = {
    manifest: {},
    methods: {},
    hooks: {},
    authenticate: null
  }

  walk(definitions, function (definition, path) {
    const { manifest, init } = definition
    if (manifest) setIn(service.manifest, path, manifest)
    if (init) {
      const { methods, hooks, authenticate } = definition.init(config, service)
      if (methods) setIn(service.methods, path, methods)
      if (hooks) setIn(service.hooks, path, hooks)
      if (authenticate && !service.authenticate) service.authenticate = authenticate
    }
  })

  if (!service.authenticate) service.authenticate = defaultAuthenticate

  return service
}
