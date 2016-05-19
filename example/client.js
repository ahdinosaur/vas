var chur = require('../')
var pull = chur.pull

var service = require('./service')

var client = chur.createClient(service)

pull(
  client.things(),
  pull.drain(function (thing) {
    console.log('thing', thing)
  })
)
