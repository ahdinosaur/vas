const depject = require('depject')
const apply = require('depject/apply')
const deepAssign = require('deep-assign')

const emitter = require('./lib/emitter')

module.exports = combine

function combine (...args) {
  const sockets = depject(...args)
  const manifests = apply.map(sockets.vas.manifest)()
  const manifest = deepAssign(...manifests)
  const handler = apply.first(sockets.vas.handler)
  return emitter({ manifest, handler })
}
