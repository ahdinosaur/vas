const Url = require('url')
const defined = require('defined')
const getIn = require('get-in')
const toPull = require('stream-to-pull-stream')
const pull = require('pull-stream')
const serializeError = require('serialize-error')
const identify = require('pull-identify-filetype')
const mime = require('mime-types')
const Qs = require('qs')
const QsTypes = require('query-types')

const defaultSerialize = require('../serialize')

module.exports = createHttpServerHandler

function createHttpServerHandler (server, options) {
  const serialize = defined(options.serialize, defaultSerialize)

  const handler = function (req, res, next) {
    const url = Url.parse(req.headers.host + req.url)
    const name = url.pathname.split('/').slice(1)
    const options = queryParse(url.query)

    const context = { id: req.id }
    var type = getIn(server.manifest, name)
    var call = getIn(server.methods, name)

    if (!(type && call)) return next()

    call = call.bind(context)

    const binary = type[type.length - 1] === '.'
    type = {
      stream: binary ? type.substring(0, type.length - 1) : type,
      binary: binary
    }

    switch (type.stream) {
      case 'source':
        if (!type.binary) {
          res.setHeader('Content-Type', 'application/json; boundary=NLNL')
        }

        if (type.binary && options.filename) {
          res.setHeader('Content-Discosition', 'inline; filename='+options.filename)
        }

        return pull(
          call(options),
          type.binary
            ? identify(function (filetype) {
              if (filetype) {
                res.setHeader('Content-Type', mime.lookup(filetype))
              } else {
                res.setHeader('Content-Type', 'application/octet-stream')
              }
            })
            : pull(
              pull.map(value => ({ value })),
              serialize.stringify()
            )
          ,
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
      if (res.finished) return

      if (err) {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 500
        }
        res.end(stringifyError(err))
        return
      }

      if (res.headersSent) {}
      else if (typeof value === 'string') {
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

function queryParse (str) {
  return QsTypes.parseObject(Qs.parse(str))
}
