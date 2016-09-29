const getIn = require('get-in')
const aspects = require('aspects').async

const syncToAsync = require('./lib/syncToAsync')
const methodName = require('./lib/methodName')

module.exports = Handler

function Handler ({ methods, hooks }) {
  return function handler (type, path, args, cb) {
    var method = getIn(methods, path)
    const hooks = getIn(hooks, path, [])

    if (method === undefined) {
      cb(new Error('method ' + methodName(path) + ' is not implemented.'))
      return
    }

    if (type === 'sync') {
      method = syncToAsync(method)
    }

    const hookedMethod = applyHooks(method, hooks)

    hookedMethod.apply(this, args.concat(cb))
  }
}

function applyHooks (fn, hooks) {
  hooks.reduce(applyHook, fn)
}

function applyHook (fn, hook) {
  const hookType = hook[0]
  const hookFn = hook[1]
  return aspects[hookType](fn, hookFn)
}
