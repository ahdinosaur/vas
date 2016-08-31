var Client = require('./client')
var HttpClient = require('./http/client')

module.exports = connect

function connect (services, options) {
  var client = Client(services, options)

  var httpClient = HttpClient(client, options)

  return httpClient
}
