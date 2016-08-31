const Url = require('url')
const defined = require('defined')
const getIn = require('get-in')
const toPull = require('stream-to-pull-stream')
const pull = require('pull-stream')

const defaultSerialize = require('../serialize')

module.exports = createHttpServerHandler

function createHttpServerHandler (server, options) {
  const serialize = defined(options.serialize, defaultSerialize)

  const handler = function (req, res, next) {
    const url = Url.parse(req.headers.host + req.url, true)
    const name = url.pathname.split('/').slice(1)
    const options = url.query

    const type = getIn(server.manifest, name)
    const call = getIn(server.methods, name)
    
    if (!(type && call)) return next()

    switch (type) {
      case 'source':
        return pull(
          call(options),
          serialize.stringify(),
          toPull.sink(res)
        )
      case 'sink':
        return pull(
          toPull.source(req),
          serialize.parse(),
          call(options)
        )
      case 'async':
        return call(options, cb)
      case 'sync':
        var value
        try {
          value = call(options)
        } catch (err) {
          return cb(err)
        }
        return cb(null, value)
    }

    function cb (err, value) {
      if (err) return next(err)

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(value, null, 2))
    }
  }

  return handler
}

function isString (s) {
  return 'string' === typeof s
}

function isObject (o) {
  return o && 'object' === typeof o
}
