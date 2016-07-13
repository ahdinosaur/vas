var pull = require('pull-stream')
var Ws = require('pull-ws/client')
var Url = require('url')
var defined = require('defined')

var createClient = require('./createClient')

module.exports = connect

function connect (services, config, options) {
  options = defined(options, {})

  var url = defined(options.url, '')
  var onConnect = options.onConnect

  var client = createClient(services, config)
  var stream = Ws.connect(
    getUrl(url),
    onConnect
  )

  pull(
    stream,
    client.createStream(),
    stream
  )

  return client
}

function getUrl (url) {
  return typeof url === 'string'
    ? url : Url.format(url)
}
