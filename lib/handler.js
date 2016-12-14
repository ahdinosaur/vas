const aspects = require('aspects').async

const syncToAsync = require('./syncToAsync')
const methodName = require('./methodName')
const abort = require('./abort')
const is = require('./is')
const getInService = require('./getInService')

module.exports = Handler

function Handler (server) {
  return function handler ({ path, args }, cb) {
    const method = getInService(server, path)
    var { type, fn, hooks } = method

    if (is.undefined(fn)) {
      return abort(type, cb, new Error('method ' + methodName(path) + ' is not implemented.'))
    }

    if (is.sync(type)) {
      fn = syncToAsync(fn)
    }

    fn = applyHooks(fn, hooks)

    if (is.request(type)) {
      fn.apply(this, args.concat(cb))
    } else {
      return fn.apply(this, args)
    }
  }
}

function applyHooks (fn, hooks = []) {
  return hooks.reduce(applyHook, fn)
}

function applyHook (fn, hook) {
  const hookType = hook[0]
  const hookFn = hook[1]
  return aspects[hookType](fn, hookFn)
}
