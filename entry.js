const apply = require('depject/apply')

const Emitter = require('./lib/emitter')
const mergeManifests = require('./lib/mergeManifests')

module.exports = entry

function entry (combinedModules) {
  const manifests = apply.map(combinedModules.vas.manifest)()
  const manifest = mergeManifests(...manifests)
  const handler = apply.first(combinedModules.vas.handler)
  return Emitter({ manifest, handler })
}
