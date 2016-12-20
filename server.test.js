var test = require('tape')

var Server = require('./server')

const service = {
  name: 'things',
  manifest: {
    all: 'source',
    get: 'async'
  },
  init: function (config) {
    return {
      methods: { all, get }
    }

    function all () {
    }

    function get (id, cb) {
    }
  }
}

test('Server returns an object  ', function (t) {
  const server = Server(service)
  t.equal(typeof server, 'object', 'Server return an object')
  t.end()
})

test('server object has keys source and sink which are functions', function (t) {
  const server = Server(service)
  t.equal(typeof server.sink, 'function', 'sink is a function')
  t.equal(typeof server.source, 'function', 'source is a function')
  t.end()
})

test('Server calls the init function in the service object', function (t) {
  const service = {
    init: function (config) {
      t.ok(true)
      t.end()
    }
  }
  Server(service)
})

test('Server passes the config object to the init function', function (t) {
  const config = {
    data: {
      1: 'human',
      2: 'computer',
      3: 'JavaScript'
    }
  }
  const service = {
    init: function (initConfig) {
      t.equal(initConfig, config)
      t.end()
    }
  }
  Server(service, config)
})

