const pull = require('pull-stream')
const Ws = require('pull-ws-server/client')
const Url= require('url')

const createClient = require('./createClient')

module.exports = connect

function connect (api, config, cb) {
  const client = createClient(api, config)
  const stream = Ws.connect(
    getUrl(config),
    (err, stream) => {
      if (!cb) return
      if (err) cb(err)
      else cb(null, client)
    }
  )

  pull(
    stream,
    client.createStream(),
    stream
  )

  return client
}

function getUrl (config) {
  return typeof config.url === 'string' ?
    config.url : Url.format(config.url)
}
