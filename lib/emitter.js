const setIn = require('set-in')

const is = require('./is')
const walk = require('./walk')

module.exports = Emitter

function Emitter (topService, handler, emitter = {}) {
  walk(topService, (service, path) => {
    const { manifest } = service
    Object.keys(manifest).forEach(name => {
      const type = manifest[name]
      const currentPath = path.concat(name)
      setIn(
        emitter,
        currentPath,
        Emit({ handler, type, path: currentPath })
      )
    })
  })

  return emitter
}

function Emit ({ handler, type, path }) {
  return function emit (...args) {
    var cb
    if (is.request(type)) {
      cb = args.pop()
    }
    return handler({ type, path, args }, cb)
  }
}
