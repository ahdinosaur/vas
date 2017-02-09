const { get } = require('libnested')

module.exports = Server

function Server (adapter, service) {
  const { manifest, handler } = service
  const adapterOptions = get(service, ['adapter', adapter.key]) || {}
  return adapter({ manifest, handler, adapter: adapterOptions })
}
