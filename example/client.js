var vas = require('../')
var pull = vas.pull

var service = require('./services/')
var config = require('./config')

var client = vas.createClient(service, config)
vas.connect(client, config)

console.log(client)

pull(
  client.things.find(),
  pull.drain(function (thing) {
    console.log('thing', thing)
  })
)
