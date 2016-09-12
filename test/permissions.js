var test = require('tape')

var vas = require('../')
var pull = vas.pull

test('permissions function that matches method name gets called', function (t) {
  t.plan(3)
  var expected = ['Timmy', 'Bob']
  var service = {
    name: 'people',
    version: '0.0.0',
    permissions: function (path, args) {
      return {
        find: function () {
          t.ok(true)
        }
      }
    },
    manifest: {
      find: 'source'
    },
    methods: function (server, config) {
      return { find}

      function find () {
        return pull.values(expected)
      }
    }
  }

  var client = vas.createClient(service, {})
  var server = vas.createServer(service, {})

  var clientStream = client.createStream()
  var serverStream = server.createStream()

  pull(
    clientStream,
    serverStream,
    clientStream
  )

  pull(
    client.people.find(),
    pull.collect(function (err, arr) {
      t.error(err)
      t.deepEqual(arr, expected)
    })
  )
})
test('permissions function that returns error denies access to the method function', function (t) {
  t.plan(2)
  var expected = ['Timmy', 'Bob']
  var service = {
    name: 'people',
    version: '0.0.0',
    permissions: function (path, args) {
      return {
        find: function () {
          t.ok(true)
          return new Error('Derp')
        }
      }
    },
    manifest: {
      find: 'source'
    },
    methods: function (server, config) {
      return { find}

      function find () {
        t.fail('find should not get called')
        return pull.values(expected)
      }
    }
  }

  var client = vas.createClient(service, {})
  var server = vas.createServer(service, {})

  var clientStream = client.createStream()
  var serverStream = server.createStream()

  pull(
    clientStream,
    serverStream,
    clientStream
  )

  pull(
    client.people.find(),
    pull.collect(function (err, arr) {
      t.ok(err)
    })
  )
})
test('authenticate passes id to this of methods', function (t) {
  const id = 234
  var expected = ['Timmy', 'Bob']
  var service = {
    name: 'people',
    version: '0.0.0',
    authenticate: function (server, config) {
      return (req, cb) => {
        t.ok(true, 'authenticate was called')
        cb(null, id)
      }
    },
    manifest: {
      find: 'async'
    },
    permissions: function (server, config) {
      return {
        find: () => {
          t.equal(this.id, id, 'id matches')
        }
      }
    },
    methods: function (server, config) {
      return { find}

      function find (cb) {
        t.equal(this.id, id, 'id matches')
        cb(null, expected)
      }
    }
  }

  var client = vas.createClient(service, {})
  var server = vas.createServer(service, {})

  var clientStream = client.createStream()
  var serverStream = server.createStream()

  pull(
    clientStream,
    serverStream,
    clientStream
  )

  client.people.find(function (err, arr) {
    t.error(err)
    t.ok(arr)
    t.end()
  })
})
