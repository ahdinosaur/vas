const pathValue = require('./pathValue')

module.exports = pathObjectValues

function pathObjectValues (path, value) {
  var ret = {}
  for (var key in value) {
    ret[key] = pathValue(path, value[key])
  }
  return ret
}
