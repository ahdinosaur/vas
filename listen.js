var assert = require('assert')
var pull = require('pull-stream')
var Ws = require('pull-ws-server')
var Url = require('url')

module.exports = listen

function listen (server, config) {
  var ws = Ws.createServer(config, handler)

  return ws.listen(config.port)

  function handler (stream) {
    pull(
      stream,
      server.createStream(),
      stream
    )
  }
}
