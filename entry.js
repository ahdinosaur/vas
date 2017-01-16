const apply = require('depject/apply')
const deepAssign = require('deep-assign')

const emitter = require('./lib/emitter')

module.exports = entry

function entry (combinedModules) {
  const manifests = apply.map(combinedModules.vas.manifest)()
  const manifest = deepAssign(...manifests)
  const handler = apply.first(combinedModules.vas.handler)
  return emitter({ manifest, handler })
}
