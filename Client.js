const { get } = require('libnested')
const pathValue = require('./lib/pathValue')

module.exports = Client

function Client (adapter, definition) {
  const { path, manifest: defManifest } = definition
  const defOptions = get(definition, ['adapter', adapter.name]) || {}
  const manifest = pathValue(path, defManifest)
  const options = pathValue(path, defOptions)
  const handler = adapter({ manifest, options })
  return { manifest, handler }
}
