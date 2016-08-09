const pull = require('pull-stream')
const Ws = require('pull-ws')
const defined = require('defined')
const http = require('http')
const Stack = require('stack')

const createServer = require('./createServer')

const DEFAULT_PORT = 5000

module.exports = listen

function listen (api, config, options) {
  options = defined(options, {})

  const port = defined(options.port, DEFAULT_PORT)
  const createHttpServer = defined(options.createHttpServer, defaultCreateHttpServer)
  const onListen = options.onListen

  const server = createServer(api, config, options)

  const handlers = [
    (req, res, next) => {
      server.authenticate(req, (err, id) => {
        if (err) console.error(err) // should we handle this error?
        req.id = id; next()
      })
    }
  ].concat(server.handlers)

  const httpServer = createHttpServer(handlers, config)

  const ws = Ws.createServer(
    Object.assign({ server: httpServer }, options),
    function onConnect (ws) {
      server.authenticate(ws, (err, id) => {
        if (err) console.error(err) // should we handle this error?
        pull(ws, server.createStream(id), ws)
      })
    }
  )

  return ws.listen(port, onListen)
}

function defaultCreateHttpServer (handlers, config) {
  return http.createServer(Stack.apply(null, handlers))
}
