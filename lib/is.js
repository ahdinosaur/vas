module.exports = {
  'undefined': isUndefined,
  string: isString,
  'function': isFunction,
  object: isObject,
  empty: isEmpty,
  syncType: isSyncType,
  asyncType: isAsyncType,
  requestType: isRequestType,
  sourceType: isSourceType,
  sinkType: isSinkType,
  duplexType: isDuplexType,
  streamType: isStreamType,
  callType: isCallType
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
  for (var key in obj) return false // eslint-disable-line no-unused-vars
  return true
}

function isSourceType (t) {
  return t === 'source'
}

function isSinkType (t) {
  return t === 'sink'
}

function isDuplexType (t) {
  return t === 'duplex'
}

function isSyncType (t) {
  return t === 'sync'
}

function isAsyncType (t) {
  return t === 'async'
}

function isRequestType (t) {
  return isSyncType(t) || isAsyncType(t)
}

function isStreamType (t) {
  return isSourceType(t) || isSinkType(t) || isDuplexType(t)
}

function isCallType (t) {
  return isString && (isRequestType(t) || isStreamType(t))
}
