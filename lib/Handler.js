const N = require('libnested')

const is = require('./is')

module.exports = Handler

function Handler ({ methods }) {
  return ({ type, path, options }) => {
    const method = N.get(methods, path)
    if (!method) return

    return is.requestType(type)
      ? cb => method(options, cb)
      : method(options)
  }
}
