const hookMethods = require('./lib/hookMethods')
const Handler = require('./lib/Handler')
const pathValue = require('./lib/pathValue')

module.exports = Server

function Server (definition) {
  const { path, methods: defMethods, manifest: defManifest, hooks } = definition
  const hookedMethods = hookMethods({ manifest: defManifest, methods: defMethods, hooks })
  const methods = pathValue(path, hookedMethods)
  const manifest = pathValue(path, defManifest)
  const handler = Handler({ methods })
  return { manifest, handler }
}
