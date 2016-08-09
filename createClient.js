var muxrpc = require('muxrpc')
var setIn = require('set-in')
var defined = require('defined')

var defaultSerialize = require('./serialize')
var walk = require('./walk')

module.exports = createClient

function createClient (services, config) {
  services = defined(services, [])
  config = defined(config, {})

  var manifest = {}

  walk(services, function (service, path) {
    // merge manifest
    setIn(manifest, path, service.manifest)
  })

  var serialize = config.serialize || defaultSerialize

  var client = muxrpc(manifest, null, serialize)()

  client.manifest = manifest

  return client
}
