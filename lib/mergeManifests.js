const deepAssign = require('deep-assign')

module.exports = mergeManifests

function mergeManifests (...manifests) {
  return deepAssign(...manifests)
}
