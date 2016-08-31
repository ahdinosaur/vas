const Url = require('url')
const defined = require('defined')
const getIn = require('get-in')
const toPull = require('stream-to-pull-stream')
const pull = require('pull-stream')
const serializeError = require('serialize-error')

const defaultSerialize = require('../serialize')

module.exports = createHttpServerHandler

function createHttpServerHandler (server, options) {
  const serialize = defined(options.serialize, defaultSerialize)

  const handler = function (req, res, next) {
    const url = Url.parse(req.headers.host + req.url, true)
    const name = url.pathname.split('/').slice(1)
    const options = url.query

    const context = { id: req.id }
    const type = getIn(server.manifest, name)
    const call = getIn(server.methods, name).bind(context)
    
    if (!(type && call)) return next()

    switch (type) {
      case 'source':
        res.setHeader('Content-Type', 'application/json; boundary=NLNL')
        return pull(
          call(options),
          pull.map(value => ({ value })),
          serialize.stringify(),
          toPull.sink(res, function (err) {
            if (err) {
              res.end(stringifyError(err))
            }
          })
        )
      case 'sink':
        return pull(
          toPull.source(req),
          pull.through(console.log),
          serialize.parse(),
          call(options, cb)
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
      res.setHeader('Content-Type', 'application/json')

      if (err) {
        res.statusCode = 500
        res.end(stringifyError(err))
      } else {
        res.end(stringifyValue(value))
      }
    }
  }

  return handler
}

function stringify (json) {
  return JSON.stringify(json, null, 2) + '\n\n'
}

function stringifyValue (value) {
  return stringify({ value })
}

function stringifyError (err) {
  const error = serializeError(err)
  return stringify({ error })
}

function wrapData (error, value) {
  if (err) {
    return { error }
  } else if (value) {
    return { value }
  }
}

function isString (s) {
  return 'string' === typeof s
}

function isObject (o) {
  return o && 'object' === typeof o
}
