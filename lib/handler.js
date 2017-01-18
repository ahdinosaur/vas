const N = require('libnested')

const is = require('./is')

module.exports = Handler

function Handler ({ path: servicePath, manifest, methods }) {
  return ({ path, args }) => {
    if (!startsWith(path, servicePath)) return

    const methodPath = path.slice(servicePath.length)
    const methodManifest = N.get(manifest, methodPath)
    const method = N.get(methods, methodPath)

    if (is.requestType(methodManifest.type)) {
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
