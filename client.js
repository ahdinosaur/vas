const drain = require('pull-stream/sinks/drain')
const Pushable = require('pull-pushable')
const Uuid = require('uuid')
const Deferred = require('pull-defer')

const Emitter = require('./lib/emitter')
const is = require('./lib/is')

module.exports = Client

function Client (service, options = {}) {
  const pending = {}

  const requests = Pushable()

  var client = {
    source: requests,
    sink: drain(receive)
  }

  Emitter(service, send, client)

  return client

  function send (request, cb) {
    const id = request.id = Uuid()
    const { type } = request
    if (is.request(type)) {
      pending[id] = cb
      requests.push(request)
    } else if (is.stream(type)) {
      const stream = Deferred[type]()
      pending[id] = stream
      requests.push(request)
      return stream
    }
  }

  function receive (result) {
    const { type, id } = result
    if (is.request(type)) {
      const cb = pending[id]
      const { value, error } = result
      cb(error, value)
    } else if (is.stream(type)) {
      const deferred = pending[id]
      const { stream } = result
      deferred.resolve(stream)
    }
    delete pending[id]
  }
}
