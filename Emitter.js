const mapManifest = require('./lib/mapManifest')
const is = require('./lib/is')

module.exports = Emitter

function Emitter ({ manifest, handler }) {
  return mapManifest(manifest, ({ type }, path) => {
    return Emit({ handler, type, path })
  })
}

function Emit ({ handler, type, path }) {
  return function emit (options, cb) {
    const result = handler({ type, path, options })
    if (is.requestType(type)) result(cb)
    else return result
  }
}
