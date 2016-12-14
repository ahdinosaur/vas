const pull = require('pull-stream')
const Pushable = require('pull-pushable')

const Emitter = require('./emitter')

module.exports = Client

function Client (service, adapter, options = {}) {
  const requests = Pushable()

  const stream = adapter(options)

  pull(requests, stream)

  return Emitter(service, requests.push, stream)
}
