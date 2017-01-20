const N = require('libnested')

const is = require('./is')

module.exports = Handler

function Handler ({ path: servicePath, methods }) {
  return ({ type, path, options }) => {
    if (!startsWith(path, servicePath)) return

    const methodPath = path.slice(servicePath.length)
    const method = N.get(methods, methodPath)

    return is.requestType(type)
      ? cb => method(options, cb)
      : method(options)
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
