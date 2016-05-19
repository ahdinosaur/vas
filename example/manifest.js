var api = require('./api')
var manifest = {}

Object.keys(api).forEach(function (name) {
  manifest[name] = api[name].manifest
})

module.exports = manifest
