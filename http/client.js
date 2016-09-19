var defined = require('defined')
var extend = require('xtend')
var Url = require('url')
var Path = require('path')
var xhr = require('pull-xhr')
var pull = require('pull-stream')
var Qs = require('qs')

var defaultSerialize = require('../serialize')

module.exports = createHttpClient

function createHttpClient (client, options) {
  options = defined(options, {})

  var serialize = defined(options.serialize, defaultSerialize)
  var manifest = client.manifest
  var url = defined(options.url, '/')
  var base = typeof url === 'object' ? url : Url.parse(url)

  return map(manifest, [], function (name, type) {
    var binary = type[type.length - 1] === '.'
    type = {
      stream: binary ? type.substring(0, type.length - 1) : type,
      binary: binary
    }

    return function (options, cb) {
      options = extend(options)
      var xhrOptions = options.xhrOptions
      delete options.xhrOptions

      var url = Url.format({
        protocol: base.protocol,
        host: base.host,
        pathname: Path.join(
          base.pathname || '/',
          name.join('/')
        ),
        search: '?' + Qs.stringify(options)
      })
      var xhrOpts = extend(xhrOptions, {
        url: url,
        responseType: type.binary ? 'arraybuffer' : 'json'
      })
      xhrOpts.headers = extend(xhrOpts.headers, {})

      switch (type.stream) {
        case 'async':
        case 'sync':
          return xhr.async(xhrOpts, function (err, data) {
            if (err) return cb(err)
            handleData(data, cb)
          })
        case 'source':
          return pull(
            xhr.source(xhrOpts),
            type.binary
              ? pull.through()
              : pull(
                serialize.parse(),
                pull.asyncMap(handleData)
              )
          )
        case 'sink':
          xhrOpts.method = 'POST'
          xhrOpts.responseType = 'json'
          return xhr.sink(xhrOpts, function (err, data) {
            var callback = cb || ifErrorThrow
            if (err) callback(err)
            else handleData(data, callback)
          })
      }
    }
  })
}

function ifErrorThrow (err) {
  if (err) throw err
}

function handleData (data, cb) {
  if (data.error) {
    cb(data.error)
  } else if (data.value) {
    cb(null, data.value)
  }
}

function map (manifest, name, fn) {
  var o = {}
  for (var key in manifest) {
    var value = manifest[key]
    if (value == null) continue
    o[key] = (
      typeof value === 'string' ? fn(name.concat(key), value)
    : (o && typeof value === 'object') ? map(value, name.concat(key), fn)
    : (function () { throw new Error('invalid manifest:' + value) })()
    )
  }
  return o
}
