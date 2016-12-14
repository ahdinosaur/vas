const is = require('./lib/is')

module.exports = Emitter

function Emitter ({ manifest }, handler, emitter = {}) {
  ;(function recurse (obj, api, path = []) {
    Object.keys(api).forEach(name => {
      const type = api[name]
      const currentPath = path.concat(name)
      obj[name] = is.object(type)
        ? recurse({}, type, currentPath)
        : Emit({ handler, type, path: currentPath })
    })
    return obj
  })(emitter, manifest)

  return emitter
}

function Emit ({ handler, type, path }) {
  return function emit (...args) {
    var cb
    if (is.request(type)) {
      cb = args.pop()
    }
    return handler({ type, path, args, cb })
  }
}
