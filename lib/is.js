module.exports = {
  'undefined': isUndefined,
  string: isString,
  'function': isFunction,
  object: isObject,
  empty: isEmpty,
  sync: isSync,
  async: isAsync,
  request: isRequest,
  source: isSource,
  sink: isSink,
  duplex: isDuplex,
  stream: isStream
}

function isUndefined (obj) {
  return typeof obj === 'undefined'
}

function isString (str) {
  return typeof str === 'string'
}

function isFunction (fn) {
  return typeof fn === 'function'
}

function isObject (obj) {
  return obj && typeof obj === 'object'
}

function isEmpty (obj) {
  for (var key in obj) return false
  return true
}

function isSource (t) {
  return t === 'source'
}

function isSink (t) {
  return t === 'sink'
}

function isDuplex (t) {
  return t === 'duplex'
}

function isSync (t) {
  return t === 'sync'
}

function isAsync (t) {
  return t === 'async'
}

function isRequest (t) {
  return isSync(t) || isAsync(t)
}

function isStream (t) {
  return isSource(t) || isSink(t) || isDuplex(t)
}
