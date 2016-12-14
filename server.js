const Handler = require('./handler')

module.exports = Server

function Server (service, adapter, options) {
  const handler = Handler(service)

  return adapter(handler, options)
}
