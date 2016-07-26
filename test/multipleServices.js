var test = require('tape')

var vas = require('../')
var pull = vas.pull

test('can create client and server streams with multiple services', function (t) {
  t.plan(4)
  var expectedPeople = ['Timmy', 'Bob']
  var expectedCats = ['Fluffy', 'Meow']
  var services = [
    {
      name: 'cats',
      version: '0.0.0',
      permissions: function (path, args) {},
      manifest: {
        find: 'source'
      },
      methods: function (server, config) {
        return { find }

        function find () {
          return pull.values(expectedCats)
        }
      }
    },
    {
      name: 'people',
      version: '0.0.0',
      permissions: function (path, args) {},
      manifest: {
        find: 'source'
      },
      methods: function (server, config) {
        return { find }

        function find () {
          return pull.values(expectedPeople)
        }
      }
    }
  ]

  var client = vas.createClient(services, {})
  var server = vas.createServer(services, {})

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
      t.deepEqual(arr, expectedPeople)
    })
  )
  pull(
    client.cats.find(),
    pull.collect(function (err, arr) {
      t.error(err)
      t.deepEqual(arr, expectedCats)
    })
  )
})
