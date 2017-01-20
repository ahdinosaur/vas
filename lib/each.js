const is = require('./is')

module.exports = each

function each (obj, iter, path = []) {
  for (var key in obj) {
    const value = obj[key]
    const stop = iter(value, path.concat(key))
    if (!stop && is.object(value)) {
      each(value, iter, path.concat(key))
    }
  }
}
