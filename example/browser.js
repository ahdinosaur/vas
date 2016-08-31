const vas = require('../')
const pull = vas.pull

const services = require('./services')
const config = require('./config')

const url = config.url
const client = vas.connect(services, config, { url })

console.log('client', client)

pull(
  client.things.find(),
  pull.through(function (thing) {
    console.log('source found thing', thing)
  }),
  client.things.log()
)

client.things.getAsync({ id: 1 }, function (err, thing) {
  console.log('async got thing', thing)
})

client.things.getSync({ id: 2 }, function (err, thing) {
  console.log('sync got thing', thing)
})
