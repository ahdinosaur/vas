const pull = require('pull-stream')
const Ws = require('pull-ws-server')

const createServer = require('./createServer')

module.exports = listen

function listen (api, config) {
  const server = createServer(api, config)
  const ws = Ws.createServer(config, handler)

  return ws.listen(config.port)

  function handler (stream) {
    pull(
      stream,
      server.createStream(),
      stream
    )
  }
}
