const http = require('http')
const Url = require('url')
const pull = require('pull-stream')
const N = require('libnested')
const assign = require('object-assign')
const deepAssign = require('deep-assign')
const queryString = require('query-string')
const explain = require('explain-error')
const toNodeStream = require('pull-stream-to-stream')
const serverSink = require('server-sink')
const Boom = require('boom')
const assert = require('assert')
const pump = require('pump')
const jsonParse = require('fast-json-parse')
const jsonStringify = require('fast-safe-stringify')
const pullJson = require('pull-json-doubleline')
const stringToNodeStream = require('from2-string')
const isNodeStream = require('is-stream')
const isPull = require('is-pull-stream')
const Route = require('http-routes')
const compose = require('http-compose')

const abort = require('../lib/abort')
const is = require('../lib/is')
const eachManifest = require('../lib/eachManifest')

module.exports = {
  needs: {
    log: 'first',
    config: {
      vas: {
        http: {
          port: 'first'
        }
      }
    },
    vas: {
      handler: 'first',
      manifest: 'map',
      http: {
        createError: 'first',
        createServer: 'first',
        createStack: 'first',
        errorHandler: 'first',
        notFoundHandler: 'first',
        handler: 'map',
        server: 'first',
        wrapError: 'first',
        valueHandler: 'first'
      }
    }
  },
  gives: {
    config: {
      vas: {
        http: {
          port: true
        }
      }
    },
    vas: {
      start: true,
      http: { 
        createStack: true,
        createError: true,
        createServer: true,
        errorHandler: true,
        notFoundHandler: true,
        handler: true,
        server: true,
        wrapError: true,
        valueHandler: true
      }
    }
  },
  create: (api) => {
    var httpServer
    return {
      config: {
        vas: { http: { port } }
      },
      vas: {
        start,
        http: {
          createError,
          createServer,
          createStack,
          errorHandler,
          notFoundHandler,
          handler,
          server,
          wrapError,
          valueHandler
        }
      }
    }

    function port () {
      return 5000
    }

    function handler (req, res) {
      return HttpHandler({
        handler: api.vas.handler,
        manifest: deepAssign(...api.vas.manifest())
      })
    }
    
    function errorHandler () {
      // code a re-image of https://github.com/yoshuawuyts/merry/blob/4aff6cbe29057b82a78e912239c341b478b8338a/index.js
      const wrapError = api.vas.http.wrapError
      const log = api.log()
      return (req, res, err) => {
        if (!err.isBoom) err = wrapError(err)

        const payload = err.output.payload
        // reformat to be consistent with streaming value output.
        var output = {
          error: {
            statusCode: payload.statusCode,
            name: payload.error,
            message: payload.message,
            data: err.data
          }
        }
        if (err.data) output.error.data = err.data

        const body = jsonStringify(payload)
        const statusCode = err.output.statusCode ||
          (res.statusCode >= 400 ? res.statusCode : 500)

        if (statusCode === 500) {
          log.warn(err)
        }

        res.statusCode = statusCode
        res.end(body)
      }
    }

    function valueHandler () {
      // code a re-image of https://github.com/yoshuawuyts/merry/blob/4aff6cbe29057b82a78e912239c341b478b8338a/index.js
      const log = api.log()
      const errorHandler = api.vas.http.errorHandler()

      return (req, res, value) => {
        var stream = null
        if (isNodeStream.readable(value)) {
          stream = value
        } else if (isPull.isSource(value)) {
          stream = toNodeStream.source(value)
        } else if (is.object(value)) {
          if (!res.getHeader('content-type')) {
            res.setHeader('content-type', 'application/json')
          }
          stream = stringToNodeStream(jsonStringify(value))
        } else if (is.string(value)) {
          stream = stringToNodeStream(value)
        }
        var sink = serverSink(req, res, msg => log.info(msg))
        if (stream) {
          pump(stream, sink, err => {
            if (err) errorHandler(req, res, err)
          })
        } else {
          sink.end()
        }
      }
    }

    function notFoundHandler () {
      // code a re-image of https://github.com/yoshuawuyts/merry/blob/4aff6cbe29057b82a78e912239c341b478b8338a/index.js
      const err = Boom.notFound()
      const errorHandler = api.vas.http.errorHandler()
      return (req, res) => {
        errorHandler(req, res, err)
      }
    }

    // NOTE (mw) a curious idea is using a series
    // of (req, res) => (nextReq, nextRes) => {} wrappers
    // instead of the (req, req, next) => {} stack
    // i wonder how well it would work.
    // for now will defer to later.

    function createStack (handlers) {
      // code a re-image of https://github.com/creationix/stack
      const valueHandler = api.vas.http.valueHandler()
      const errorHandler = api.vas.http.errorHandler()
      const notFoundHandler = api.vas.http.notFoundHandler()

      const handler = compose(handlers)

      return (req, res) => {
        handler(req, res, {}, (err, value) => {
          if (err) errorHandler(req, res, err)
          else if (value) valueHandler(req, res, value)
          else notFoundHandler(req, res)
        })
      }
    }

    function server () {
      // only create one http server so this function
      // provides a shared reference.
      if (!httpServer) {
        httpServer = api.vas.http.createServer(
          api.vas.http.createStack(
            api.vas.http.handler()
          )
        )
      }
      return httpServer
    }

    function start (cb) {
      const log = api.log()
      const httpServer = api.vas.http.server()

      console.log('start!')

      httpServer.listen(api.config.vas.http.port(), function () {
        log.info({
          message: 'listening',
          port: httpServer.address().port,
          env: process.env.NODE_ENV || 'undefined'
        })
        cb && cb()
      })

      return stop

      function stop (cb) {
        httpServer.close(cb)
      }
    }

    function createServer (requestListener) {
      return http.createServer(requestListener)
    }
  }
}


function HttpHandler ({ handler, manifest }) {
  var routes = []
  eachManifest(manifest, (value, path) => {
    const callManifest = N.get(manifest, path)
    const {
      type,
      path: callPath = path,
      responseType = 'json',
      statusCode
    } = callManifest

    var responseHeaders = {}
    for (const key in callManifest.responseHeaders) {
      responseHeaders[key.toLowerCase()] = callManifest.responseHeaders[key]
    }

    const urlPath = '/' + callPath.join('/')
    const route = [urlPath, (req, res, context, next) => {
      const queryParams = queryString.parse(context.url.query)
      const params = assign({}, context.params, queryParams)

      try {
        var args = params.args ? JSON.parse(params.args) : []
      } catch (err) {
        return next(explain(err, 'error parsing JSON in query string'))
      }

      const call = { type, path, args }
      var value = handler(call)

      for (const key in responseHeaders) {
        res.setHeader(key, responseHeaders[key])
      }
      
      if (statusCode) {
        res.statusCode = statusCode
      }

      if (is.requestType(type)) {
        value((err, value) => {
          if (err) next(err)
          else next(null, { value })
        })
      }
      else if (is.streamType(type)) {
        if (is.sourceType(type)) {
          if (responseType === 'json') {
            if (responseHeaders['content-type'] === undefined) {
              res.setHeader('Content-Type', 'application/json; boundary=NLNL')
            }
            value = pull(
              value,
              pull.map(value => ({ value })),
              pullJson.stringify()
            )
          } else if (responseType === 'blob') {
            value = pull(
              value,
              responseHeaders['content-type'] === undefined
                ? identify(function (filetype) {
                  if (filetype) {
                    res.setHeader('content-type', mime.lookup(filetype))
                  } else {
                    res.setHeader('content-type', 'application/octet-stream')
                  }
                })
                : pull.through()
            )
          }
        }
        next(null, value)
      }
    }]
    routes.push(route)
  })
  return Route(routes)
}

function createError (opts) {
  assert.equal(typeof opts, 'object', 'vas/http/server#createError: opts should be type object')
  const { statusCode, message, data } = options
  assert.equal(typeof statusCode, 'number', 'vas/http/server#createError: statusCode should be type number')
  return Boom.create(statusCode, message, data)
}

function wrapError (err, options = {}) {
  assert.equal(typeof err, 'object', 'vas/http/server#wrapError: err should be type object')
  assert.equal(typeof options, 'object', 'vas/http/server#wrapError: opts should be type object')
  const { statusCode, message } = options
  return Boom.wrap(err, statusCode, message)
}
