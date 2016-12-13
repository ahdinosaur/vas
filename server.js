module.exports = Server

function Server (service, options = {}) {
  const { adapter } = options

  const handler = Handler(service)

  return adapter(handler, options)
}
