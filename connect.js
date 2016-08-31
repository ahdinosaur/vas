var pull = require('pull-stream')
var Url = require('url')
var defined = require('defined')

var Client = require('./client')
var HttpClient = require('./http/client')

module.exports = connect

function connect (services, config, options) {
  options = defined(options, {})

  var url = defined(options.url, '/')
  var onConnect = options.onConnect

  var client = Client(services, config, options)

  var httpClient = HttpClient(client, options)

  return httpClient
}
