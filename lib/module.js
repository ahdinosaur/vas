const N = require('libnested')

const is = require('./is')
const mapManifest = require('./mapManifest.js')
const Handler = require('./handler')

module.exports = Module

function Module (definition) {
  const {
    name,
    path = [name],
    needs = {},
    manifest,
    create
  } = definition

  return {
    needs,
    gives: Gives({ path, manifest }),
    create: Create({ path, manifest, create })
  }
}

function Gives ({ path, manifest }) {
  var gives = {}
  N.set(gives, path, mapManifest(manifest, v => true))
  gives.vas = {
    handler: true,
    manifest: true
  }
  return gives
}

function Create ({ path, manifest, create }) {
  return (api) => {
    const methods = create(api)
    const handler = Handler({ path, methods })
    var exports = {
      vas: {
        manifest: scopedGive(path, manifest),
        handler
      }
    }
    N.set(exports, path, methods)
    return exports
  }
}

function scopedGive (path, value) {
  var give = {}
  N.set(give, path, value)
  return () => give
}
