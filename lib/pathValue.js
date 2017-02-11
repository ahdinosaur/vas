const { set } = require('libnested')

module.exports = pathValue

function pathValue (path, value) {
  var ret = {}
  set(ret, path, value)
  return ret
}
