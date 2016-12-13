const pull = require('pull-stream')
const Pushable = require('pull-pushable')

module.exports = Client

function Client (service, options = {}) {
  const { adapter } = options
  const requests = Pushable()

  const stream = adapter(options)

  pull(requests, stream)

  return emitter(service, requests.push, stream)
}
