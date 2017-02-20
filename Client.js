const { get } = require('libnested')
const pathValue = require('./lib/pathValue')

module.exports = Client

function Client (adapter, definition) {
  const { path, manifest: defManifest } = definition
  const defAdapterOptions = get(definition, ['adapter', adapter.key]) || {}
  const manifest = pathValue(path, defManifest)
  const adapterOptions = pathValue(path, defAdapterOptions)
  const handler = adapter({ manifest, adapter: adapterOptions })
  return { manifest, handler }
}
