const N = require('libnested')
const aspects = require('aspects').async

const syncToAsync = require('./syncToAsync')
const is = require('./is')

module.exports = Methods

function Methods (definition) {
  const {
    manifest = {},
    methods = {},
    hooks = {}
  } = definition

  return N.map(methods, (methodFn, methodPath) => {
    const methodType = N.get(manifest, methodPath)
    const methodHooks = N.get(hooks, methodPath) || []

    if (is.sync(methodType)) {
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
