const N = require('libnested')

const is = require('./is')

module.exports = Emitter

function Emitter ({ manifest, handler }) {
  return N.map(manifest, (type, path) => {
    return Emit({ handler, type, path })
  })
}

function Emit ({ handler, type, path }) {
  return function emit (...args) {
    if (is.request(type)) var cb = args.pop()
    const result = handler({ type, path, args })
    if (is.request(type)) result(cb)
    else return result
  }
}
