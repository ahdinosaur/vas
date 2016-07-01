var pull = require('pull-stream')
var Ws = require('pull-ws-server/client')
var Url = require('url')

var createClient = require('./createClient')

module.exports = connect

function connect (api, config, cb) {
  var client = createClient(api, config)
  var stream = Ws.connect(
    getUrl(config),
    function (err, stream) {
      if (!cb) return
      if (err) cb(err)
      else cb(null, client)
    }
  )

  pull(
    stream,
    client.createStream(),
    stream
  )

  return client
}

function getUrl (config) {
  return typeof config.url === 'string'
    ? config.url : Url.format(config.url)
}
