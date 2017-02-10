const hookMethods = require('./lib/hookMethods')
const Handler = require('./lib/Handler')
const pathValue = require('./lib/pathValue')

module.exports = Service

function Service (definition) {
  const { path, methods: defMethods, manifest: defManifest, hooks, adapter: defAdapterOptions } = definition
  const hookedMethods = hookMethods({ manifest: defManifest, methods: defMethods, hooks })
  const methods = pathValue(path, hookedMethods)
  const manifest = pathValue(path, defManifest)
  const adapter = pathObjectValues(path, defAdapterOptions)
  const handler = Handler({ methods })
  return { manifest, handler, adapter }
}

function pathObjectValues (path, value) {
  var ret = {}
  for (var key in value) {
    ret[key] = pathValue(path, value[key])
  }
  return ret
}
