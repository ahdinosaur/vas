var pull = require('pull-stream')
var Ws = require('pull-ws-server')

module.exports = connect

function connect (client, config) {
  var stream = Ws.connect(getUrl(config), config)

  pull(
    stream,
    client.createStream(),
    stream
  )

  return client
}

function getUrl (config) {
  return typeof config.url === 'string' ?
    config.url : Url.format(config.url)
}
