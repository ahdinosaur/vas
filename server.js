const { assign } = Object
const pull = require('pull-stream/pull')
const asyncMap = require('pull-stream/throughs/async-map')
const drain = require('pull-stream/sinks/drain')
const Pushable = require('pull-pushable')

const Handler = require('./lib/handler')
const is = require('./lib/is')
const mapService = require('./lib/mapService')

module.exports = Server

function Server (topService = [], config = {}) {
  const server = mapService(topService, (service) => {
    const { name, manifest, init } = service
    return assign(
      { name, manifest },
      init(config, topService)
    )
  })

  const handler = Handler(server)
  const responses = Pushable()

  return {
    source: responses,
    sink: pull(
      asyncMap((request, cb) => {
        const { type } = request

        if (is.request(type)) {
          handler(request, (error, value) => {
            cb(null, assign(request, { error, value }))
          })
        } else if (is.stream(type)) {
          return cb(null, assign(request, {
            stream: handler(request)
          }))
        }
      }),
      drain(responses.push, responses.end)
    )
  }
}
