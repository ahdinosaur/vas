module.exports = syncToAsync

function syncToAsync (fn) {
  return function (...args) {
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
