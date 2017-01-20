const each = require('./each')
const is = require('./is')

module.exports = eachManifest

function eachManifest (manifest, iter) {
  each(manifest, (value, path) => {
    if (is.callType(value)) {
      iter({ type: value }, path)
    } else if (is.object(value) && is.callType(value.type)) {
      iter(value, path)
      // signal to stop iterating deeper
      return true
    }
  })
}
