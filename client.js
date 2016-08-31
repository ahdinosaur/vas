var setIn = require('set-in')
var defined = require('defined')

var walk = require('./walk')

module.exports = Client

function Client (services, config) {
  services = defined(services, [])
  config = defined(config, {})

  var client = {
    manifest: {}
  }

  walk(services, function (service, path) {
    // merge manifest
    setIn(client.manifest, path, service.manifest)
  })

  return client
}
