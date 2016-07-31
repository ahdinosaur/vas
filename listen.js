const pull = require('pull-stream')
const Ws = require('pull-ws')
const defined = require('defined')

const createServer = require('./createServer')

const DEFAULT_PORT = 6000

module.exports = listen

function listen (api, config, options) {
  options = defined(options, {})

  const port = defined(options.port, DEFAULT_PORT)
  const onListen = options.onListen
  const getId = defined(options.getId, defaultGetId)

  const server = createServer(api, config)
  const ws = Ws.createServer(options, onConnect)

  return ws.listen(port, onListen)

  function onConnect (ws) {
    getId(ws, function (err, id) {
      if (err) {
        return pull(
          pull.error(err),
          ws.sink
        )
      }

      pull(
        ws,
        server.createStream(id),
        ws
      )
    })
  }
}

function defaultGetId (ws, cb) {
  cb(null, null)
}
