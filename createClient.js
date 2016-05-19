var muxrpc = require('muxrpc')

var defaultSerialize = require('./serialize')

module.exports = createClient

function createClient (api, config) {
  const serialize = config.serialize || defaultSerialize

  return muxrpc(null, api.manifest, serialize)()
}
