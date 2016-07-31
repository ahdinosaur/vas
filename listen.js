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

  const server = createServer(api, config)

  const context = { id: null }
  const boundHandlers = server.handlers.map(handler => handler.bind(context))
  const httpServer = createHttpServer(boundHandlers, config)

  const ws = Ws.createServer(
    Object.assign({ server: httpServer }, options),
    onConnect
  )

  return ws.listen(port, onListen)

  function onConnect (ws) {
    pull(ws, server.createStream(context.id), ws)
  }
}

function defaultCreateHttpServer (handlers, config) {
  return http.createServer(Stack.apply(null, handlers))
}
