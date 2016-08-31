var setIn = require('set-in')
var defined = require('defined')

var walk = require('./walk')

module.exports = createClient

function createClient (services, options) {
  services = defined(services, [])
  options = defined(options, {})

  var client = {
    manifest: {}
  }

  walk(services, function (service, path) {
    // merge manifest
    setIn(client.manifest, path, service.manifest)
  })

  return client
}
