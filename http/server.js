const http = require('http')
const Url = require('url')
const pull = require('pull-stream')
const N = require('libnested')
const assign = require('object-assign')
const deepAssign = require('deep-assign')
const queryString = require('query-string')
const explain = require('explain-error')
const toPull = require('stream-to-pull-stream')
const serverSink = require('server-sink')

const abort = require('../lib/abort')

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
        createServer: 'first',
        handler: 'map',
        server: 'first',
        wrapHandler: 'reduce'
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
        createServer: true,
        handler: true,
        server: true,
        wrapHandler: true
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
          createServer,
          handler,
          server,
          wrapHandler
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
      })(req, res)
    }
    
    function wrapHandler (handler) {
      const log = api.log()
      return wrapHttpHandler({ handler, log })
    }

    function server () {
      // only create one http server so this function
      // provides a shared reference.
      if (!httpServer) {
        httpServer = api.vas.http.createServer(
          api.vas.http.wrapHandler(
            api.vas.http.handler
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
  return (req, res) => {
    console.log(req, res)
    const url = Url.parse(req.headers.host + req.url)
    const path = url.pathname.split('/').slice(1)
    const type = N.get(manifest, path)

    const params = queryString.parse(url.query)
    try {
      const args = JSON.parse(params.args)
    } catch (err) {
      return abort.source(explain(err, 'vas/http/server: error parsing JSON'))
    }

    // const context = { id: req.id }
    const call = { type, path, args }
    console.log('call', call)
    return pull.empty()
  }
}

function wrapHttpHandler ({ handler, log }) {
  return (nodeReq, nodeRes) => {
    var req = toPull(nodeReq)
    assign(req, {
      url: nodeReq.url,
      method: nodeReq.method,
      headers: nodeReq.headers
    })
    var res = toPull(nodeRes)

    var source = handler(req, res)

    if (source.statusCode) {
      nodeRes.statusCode = source.statusCode
    }
    if (source.headers) {
      for (var key in source.headers) {
        nodeRes.setHeader(key, source.headers[key])
      }
    }

    // TODO replace with pure pull streams
    var sink = toPull(serverSink(nodeReq, nodeRes, msg => {
      log.info(msg)
    }))

    pull(source, sink)
  }
}

function Stack (layers, errorHandler) {
  var handle = errorHandler
  layers.reverse().forEach(function (layer) {
    var child = handle
    handle = function (req, res) {
      try {
        layer(req, res, function (err) {
          if (err) errorHandler(req, res, err)
          else child(req, res)
        })
      } catch (err) {
        errorHandler(req, res, err)
      }
    }
  })
  return handle
}
