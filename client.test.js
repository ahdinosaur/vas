const test = require('tape')
const Client = require('./client')

const service = {
  name: 'things',
  manifest: {
    all: 'source',
    get: 'async'
  }
}

test('Client returns an object  ', function(t) {
  const client = Client(service)
  t.equal(typeof client, 'object', 'Client return an object')
  t.end()
})

test('client object has keys source and sink which are functions', function(t) {
  const client = Client(service)
  t.equal(typeof client.sink, 'function', 'sink is a function')
  t.equal(typeof client.source, 'function', 'source is a function')
  t.end()
})

test('client object has a service that matches the name on the service object', function(t) {
  const client = Client(service)
  t.ok(client[service.name])
  t.end()
})

test('service has keys supplied in manifest', function(t) {
  const client = Client(service)
  Object.keys(service.manifest).forEach(key => {
    t.ok(client[service.name][key]) 
  })
  t.end()
})
