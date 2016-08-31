var getIn = require('get-in')
var aspects = require('aspects').async

var syncToAsync = require('./lib/syncToAsync')
var methodName = require('./lib/methodName')

module.exports = Handler

function Handler (methods, hooks) {
  return function handler (type, path, args, cb) {
    var method = getIn(methods, path)

    if (method === undefined) {
      cb(new Error('method ' + methodName(path) + ' is not implemented.'))
      return
    }

    if (type === 'sync') {
      method = syncToAsync(method)
    }

    var hooks = getIn(hooks, path, [])
    var hookedMethod = applyHooks(method, hooks)

    hookedMethod.apply(this, args.concat(cb))
  }
}

function applyHooks (fn, hooks) {
  hooks.reduce(applyHook, fn)
}

function applyHook (fn, hook) {
  var hookType = hook[0]
  var hookFn = hook[1]
  return aspects[hookType](fn, hookFn)
}
