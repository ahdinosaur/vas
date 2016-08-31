var sliced = require('sliced')

module.exports = syncToAsync

function syncToAsync (fn) {
  return function () {
    var args = sliced(arguments)
    var cb = args.pop()
    try {
      var result = fn.apply(this, args)
    } catch (err) {
      cb(err)
      return
    }
    cb(null, result)
  }
}
