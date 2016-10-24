const getIn = require('get-in')
const aspects = require('aspects').async

const syncToAsync = require('./lib/syncToAsync')
const methodName = require('./lib/methodName')
const abort = require('./lib/abort')
const is = require('./lib/is')

module.exports = Handler

function Handler ({ methods, hooks }) {
  return function handler (type, path, args, cb) {
    var method = getIn(methods, path)
    const hooks = getIn(hooks, path, [])

    if (is.undefined(method)) {
      return abort(type, cb, new Error('method ' + methodName(path) + ' is not implemented.'))
    }

    if (is.sync(type)) {
      method = syncToAsync(method)
    }

    const hookedMethod = applyHooks(method, hooks)

    if (is.request(type)) {
      hookedMethod.apply(this, args.concat(cb))
    } else {
      return hookedMethod.apply(this, args)
    }
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
