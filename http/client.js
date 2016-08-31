var defined = require('defined')
var Url = require('url')
var getIn = require('get-in')
var Path = require('path')
var toPull = require('stream-to-pull-stream')
var defer = require('pull-defer')
var get = require('simple-get')
var pull = require('pull-stream')

var defaultSerialize = require('../serialize')

module.exports = createHttpClient

function createHttpClient (client, options) {
  options = defined(options, {})

  var serialize = defined(options.serialize, defaultSerialize)
  var manifest = client.manifest
  var url = options.url
  var base = isObject(url) ? url : Url.parse(url)

  return map(manifest, [], function (name, type) {
    return function (options, cb) {
      var url = Url.format({
        protocol: base.protocol,
        host: base.host,
        pathname: Path.join(
          base.pathname || '/',
          name.join('/')
        ),
        query: options
      })

      switch (type) {
        case 'async':
        case 'sync':
          return get.concat({
            url: url,
            json: true
          }, function (err, res, data) {
            cb(err, data)
          })
        case 'source':
          var deferred = defer.source()
          get(url, function (err, res) {
            if (err) return deferred.abort(err)

            var source = pull(
              toPull.source(res),
              serialize.parse()
            )
            deferred.resolve(source)
          })
          return deferred
      }
    }
  })
}

function map(manifest, name, fn) {
  var o = {}
  for(var key in manifest) {
    var value = manifest[key]
    if (value == null) continue
    o[key] = (
      isString(value) ? fn(name.concat(key), value)
    : isObject(value) ? map(value, name.concat(key), fn)
    : (function () { throw new Error('invalid manifest:' + value) })()
    )
  }
  return o
}

function isObject (o) {
  return o && 'object' === typeof o
}

function isString (s) {
  return 'string' === typeof s
}
