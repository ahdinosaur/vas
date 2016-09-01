const Url = require('url')
const defined = require('defined')
const getProp = require('@f/get-prop')
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
    var type = getProp(name, server.manifest)
    const call = getProp(name, server.methods).bind(context)

    if (!(type && call)) return next()

    const binary = type[type.length - 1] === '.'
    type = {
      stream: binary ? type.substring(0, type.length - 1) : type,
      binary: binary
    }

    switch (type.stream) {
      case 'source':
        if (type.binary) {
          res.setHeader('Content-Type', 'application/octet-stream')
        } else {
          res.setHeader('Content-Type', 'application/json; boundary=NLNL')
        }

        return pull(
          call(options),
          type.binary ? pull.through() : pull(
            pull.map(value => ({ value })),
            serialize.stringify()
          ),
          toPull.sink(res, function (err) {
            if (err) {
              res.end(stringifyError(err))
            }
          })
        )
      case 'sink':
        return pull(
          toPull.source(req),
          type.binary ? pull.through() : serialize.parse(),
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
      if (err) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 500
        res.end(stringifyError(err))
        return
      }

      if (typeof value === 'string') {
        res.setHeader('Content-Type', 'text/plain')
      } else if (Buffer.isBuffer(value)) {
        res.setHeader('Content-Type', 'application/octet-stream')
      } else {
        res.setHeader('Content-Type', 'application/json')
      }
      res.end(stringifyValue(value))
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
