const Path = require('path')
const Url = require('url')
const extend = require('xtend')
const pull = require('pull-stream/pull')
const drain = require('pull-stream/sinks/drain')
const Pushable = require('pull-pushable')
const pullCat = require('pull-cat')
const pullXhr = require('pull-xhr')

const is = require('../lib/is')
const { serialize: defaultSerialize } = require('../defaults')

module.exports = createHttpConnection

function createHttpConnection (options = {}) {
  const {
    url = '/',
    xhrOptions = {},
    serialize = defaultSerialize
  } = options
  const base = is.object(url) ? url : Url.parse(url)

  var connection
  const responses = Pushable(err => {
    connection.sink.abort(err)
  })

  connection = {
    source: responses,
    sink: drain(send)
  }

  return connection

  function send (request) {
    console.log('send', request)
    const { type, path, args } = request

    const url = Url.format({
      protocol: base.protocol,
      host: base.host,
      pathname: Path.join(
        base.pathname || '/',
        path.join('/')
      )
    })
    var xhrOpts = {
      url,
      method: 'POST',
      responseType: 'json'
    }

    switch (type) {
      case 'sync':
      case 'async':
        pullXhr.async(
          extend(xhrOpts, { json: args }),
          cb
        )
        break;
      case 'source':
        pull(
          pullXhr.source(xhrOpts),
          serialize.parse(),
          drain(resolve)
        )
        break;
      case 'sink':
        const requestStream = Pushable()
        const response = extend(request, {
          stream: drain(requestStream)
        })
        requestStream.push(args)
        xhrOpts.method = 'POST'
        pull(
          requestStream,
          pullXhr.sink(xhrOptions, cb)
        )
    }

    function cb (err, data) {
      if (err) abort(err)
      else resolve(extend(request, data))
    }
  }

  function abort (err) {
    responses.abort(err)
  }

  function resolve (data) {
    responses.push(data)
  }
}
