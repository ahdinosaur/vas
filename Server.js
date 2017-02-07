const { set } = require('libnested')

const hookMethods = require('./lib/hookMethods')
const Handler = require('./lib/Handler')

module.exports = Server

function Server (definition) {
  const { path, manifest, methods, hooks } = definition
  const hookedMethods = hookMethods({ manifest, methods, hooks })
  const handler = Handler({ path, methods: hookedMethods })
  const pathedManifest = pathValue(path, manifest)
  return { manifest: pathedManifest, handler }
}

function pathValue (path, value) {
  var ret = {}
  set(ret, path, value)
  return ret
}
