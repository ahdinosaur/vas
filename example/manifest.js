var api = require('./services/')
var manifest = {}

Object.keys(api).forEach(function (name) {
  manifest[name] = api[name].manifest
})

module.exports = manifest
