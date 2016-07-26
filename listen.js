const pull = require('pull-stream')
const Ws = require('pull-ws/server')
const defined = require('defined')

const createServer = require('./createServer')

const DEFAULT_PORT = 6000

module.exports = listen

function listen (api, config, options) {
  options = defined(options, {})

  const port = defined(options.port, DEFAULT_PORT)
  const onListen = options.onListen

  const server = createServer(api, config)
  const ws = Ws.createServer(config, onConnect)

  return ws.listen(port, onListen)

  function onConnect (stream) {
    pull(
      stream,
      server.createStream(),
      stream
    )
  }
}
