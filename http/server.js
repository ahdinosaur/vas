const http = require('http')
const Stack = require('stack')

module.exports = {
  needs: {
    log: 'first',
    vas: {
      handler: 'first',
      http: {
        port: 'first',
        handler: 'map',
        stackHandlers: 'first',
        createServer: 'first'
      }
    }
  },
  gives: {
    vas: {
      start: true,
      http: { 
        port: true,
        handler: true,
        stackHandlers: true,
        createServer: true
      }
    }
  },
  create: (api) => {
    return {
      vas: {
        start,
        http: {
          port,
          handler,
          stackHandlers,
          createServer
        }
      }
    }

    function port () {
      return 5000
    }

    function handler () {
      return (req, res, next) => {
        console.log('url', req.url)
      }
    }

    function start (cb) {
      const httpServer = api.vas.http.createServer(
        api.vas.http.stackHandlers(
          api.vas.http.handler()
        )
      )

      console.log('start!')

      httpServer.listen(api.vas.http.port(), function () {
        api.log('info', {
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

    function stackHandlers (handlers) {
      return Stack(...handlers)
    }

    function createServer (requestListener) {
      return http.createServer(requestListener)
    }
  }
}
