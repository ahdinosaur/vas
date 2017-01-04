const is = require('./is')

const N = require('libnested')

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
  N.set(gives, path, N.map(manifest, v => true))
  gives.vas = {
    handler: true,
    manifest: true
  }
  return gives
}

function Create ({ path, manifest, create }) {
  manifest = Manifest({ path, manifest })
  return (api) => {
    const methods = create(api)
    const handler = Handler({ path, methods })
    var exports = { vas: { manifest, handler } }
    N.set(exports, path, methods)
    return exports
  }
}

function Manifest ({ path, manifest }) {
  var mfest = {}
  N.set(mfest, path, manifest)
  return () => mfest
}

function Handler ({ path: servicePath, methods }) {
  return ({ type, path, args }) => {
    if (!startsWith(path, servicePath)) return

    const methodPath = path.slice(servicePath.length)
    const method = N.get(methods, methodPath)
    if (is.request(type)) {
      return (cb) => method(...args, cb)
    } else {
      return method(...args)
    }
  }
}

function startsWith (array, prefix) {
  var len = prefix.length
  var i = -1
  while (++i < len) {
    if (array[i] !== prefix[i]) {
      return false
    }
  }
  return true
}
