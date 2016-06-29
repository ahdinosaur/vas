const muxrpc = require('muxrpc')
const setIn = require('set-in')

const defaultSerialize = require('./serialize')
const walk = require('./walk')

module.exports = createClient

function createClient (services, config) {
  var manifest = {}

  walk(services, function (service, path) {
    // merge manifest
    setIn(manifest, path, service.manifest)
  })

  const serialize = config.serialize || defaultSerialize

  return muxrpc(manifest, null, serialize)()
}

