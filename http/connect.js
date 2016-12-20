const Path = require('path')
const Url = require('url')
const extend = require('xtend')
const pull = require('pull-stream/pull')
const drain = require('pull-stream/sinks/drain')
const Pushable = require('pull-pushable')
const pullXhr = require('pull-xhr')

const is = require('../lib/is')

module.exports = createHttpConnection

function createHttpConnection (options = {}) {
  const {
    url = '/',
    xhrOptions = {}
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
        break
      case 'source':
        resolveStream(
          pullXhr.source(
            extend(xhrOpts, { json: args })
          )
        )
        break
      case 'sink':
        const requestStream = Pushable()
        requestStream.push(args)
        xhrOpts.method = 'POST'
        pull(
          requestStream,
          pullXhr.sink(xhrOptions, cb)
        )
        resolveStream(drain(requestStream.push))
        break
    }

    function cb (err, data) {
      if (err) abort(err)
      else resolve(extend(request, data))
    }

    function resolveStream (stream) {
      resolve(extend(request, { stream }))
    }
  }

  function abort (err) {
    responses.abort(err)
  }

  function resolve (data) {
    responses.push(data)
  }
}
