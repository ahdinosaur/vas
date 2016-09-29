const setIn = require('set-in')

const walk = require('./walk')

module.exports = Client

function Client (services = [], config = {}) {
  var client = {
    manifest: {}
  }

  walk(services, function (service, path) {
    // merge manifest
    setIn(client.manifest, path, service.manifest)
  })

  return client
}
