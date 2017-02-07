const N = require('libnested')
const aspects = require('aspects').async

const mapManifest = require('./mapManifest')
const syncToAsync = require('./syncToAsync')
const is = require('./is')

module.exports = hookMethods

function hookMethods (definition) {
  var {
    manifest = {},
    methods = {},
    hooks = {}
  } = definition

  // normalize manifest
  manifest = mapManifest(manifest)

  return N.map(methods, (methodFn, methodPath) => {
    const methodType = N.get(manifest, methodPath.concat('type'))
    const methodHooks = N.get(hooks, methodPath) || []

    if (is.syncType(methodType)) {
      methodFn = syncToAsync(methodFn)
    }

    return applyHooks(methodFn, methodHooks)
  })
}

function applyHooks (fn, hooks = []) {
  return hooks.reduce(applyHook, fn)
}

function applyHook (fn, hook) {
  const hookType = hook[0]
  const hookFn = hook[1]
  return aspects[hookType](fn, hookFn)
}
