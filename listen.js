const pull = require('pull-stream')
const defined = require('defined')
const http = require('http')
const Stack = require('stack')

const Handler = require('./http/server')
const Server = require('./server')

const DEFAULT_PORT = 5000

module.exports = listen

function listen (api, config, options) {
  options = defined(options, {})

  const port = defined(options.port, DEFAULT_PORT)
  const createHttpServer = defined(options.createHttpServer, defaultCreateHttpServer)
  const onListen = options.onListen

  const server = Server(api, config, options)

  const handlers = [
    (req, res, next) => {
      server.authenticate(req, (err, id) => {
        if (err) console.error(err) // should we handle this error?
        req.id = id; next()
      })
    }
  ].concat(server.handlers).concat([
    Handler(server, options)
  ])

  const httpServer = createHttpServer(handlers, config)

  return httpServer.listen(port, onListen)
}

function defaultCreateHttpServer (handlers, config) {
  return http.createServer(Stack.apply(null, handlers))
}
