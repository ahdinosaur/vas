const mapManifest = require('./mapManifest')
const is = require('./is')

module.exports = Emitter

function Emitter ({ manifest, handler }) {
  return mapManifest(manifest, ({ type }, path) => {
    return Emit({ handler, type, path })
  })
}

function Emit ({ handler, type, path }) {
  return function emit (...args) {
    if (is.requestType(type)) var cb = args.pop()
    const result = handler({ type, path, args })
    if (is.requestType(type)) result(cb)
    else return result
  }
}
