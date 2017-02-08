const { first } = require('depject/apply')
const deepAssign = require('deep-assign')

module.exports = combine
module.exports.manifests = combineManifests
module.exports.handlers = combineHandlers
module.exports.adapters = combineAdapters

function combine (services = []) {
  const total = services.reduce((sofar, next) => {
    return {
      manifests: [...sofar.manifests, next.manifest],
      handlers: [...sofar.handlers, next.handler],
      adapters: [...sofar.adapters, next.adapter]
    }
  }, { manifests: [], handlers: [], adapters: [] })
  return {
    manifest: combineManifests(total.manifests),
    handler: combineHandlers(total.handlers),
    adapter: combineAdapters(total.adapters)
  }
}

function combineManifests (manifests = []) {
  return deepAssign({}, ...manifests)
}

function combineHandlers (handlers = []) {
  return first(handlers)
}

function combineAdapters (adapters = []) {
  return deepAssign({}, ...adapters)
}
