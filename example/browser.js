const vas = require('../')
const pull = vas.pull

const services = require('./services')
const config = require('./config')

const url = config.url
const client = vas.connect(services, config, { url })

console.log('client', client)

pull(
  client.things.find(),
  pull.drain(function (thing) {
    console.log('thing', thing)
  })
)
