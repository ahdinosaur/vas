module.exports = Emitter

function Emitter (manifest, handler) {
  var emitter = {}

  ;(function recurse (obj, api, path = []) {
    Object.keys(api).forEach(name => {
      const type = api[name]
      const currentPath = path.concat(name)
      obj[name] =
          type == null
        ? recurse({}, type, currentPath)
        : Emit({ handler, type, path: currentPath })
    })
    return obj
  })(emitter, manifest)

  return emitter
}

function Emit ({ handler, type, path }) {
  return function emit (...args) {
    return handler.call(this, type, path, args)
  }
}
