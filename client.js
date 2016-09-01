var setProp = require('@f/set-prop')
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
    client.manifest = setProp(path, client.manifest, service.manifest)
  })

  return client
}
