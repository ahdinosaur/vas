const { set } = require('libnested')

const eachManifest = require('./eachManifest')

module.exports = mapManifest

function mapManifest (manifest, fn = id) {
  var mapped = {}
  eachManifest(manifest, (value, path) => {
    set(mapped, path, fn(value, path))
  })
  return mapped
}

function id (m) { return m }
