var vas = require('../')
var pull = vas.pull

var services = require('./services')
var config = require('./config')

var client = vas.connect(services, config)

console.log('client', client)

pull(
  client.things.find(),
  pull.drain(function (thing) {
    console.log('thing', thing)
  })
)
