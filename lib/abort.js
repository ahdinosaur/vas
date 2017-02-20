const pullError = require('pull-stream/sources/error')
const is = require('./is')

module.exports = abort
module.exports.stream = abortStream
module.exports.source = abortSource
module.exports.sink = abortSink
module.exports.duplex = abortDuplex

function abort (type, cb, err) {
  return (
    is.request(type) ? cb(err)
    : abortStream(type, err)
  )
}

function abortStream (type, err) {
  return (
    is.source(type) ? abortSource(err)
    : is.sink(type) ? abortSink(err)
    : is.duplex(type) ? abortDuplex(err)
    : null
  )
}

function abortSource (err) {
  return pullError(err)
}

function abortSink (err) {
  return function (read) {
    read(err || true, function () {})
  }
}

function abortDuplex (err) {
  return {
    source: abortSource(err),
    sink: abortSink(err)
  }
}
