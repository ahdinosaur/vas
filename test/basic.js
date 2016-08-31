var test = require('tape')

var vas = require('../')
var pull = vas.pull

test('can create a client and server streams', function (t) {
  var expected = ['Timmy', 'Bob']
  var service = {
    name: 'people',
    version: '0.0.0',
    permissions: function (path, args) {},
    manifest: {
      find: 'source'
    },
    methods: function (server, config) {
      return { find }

      function find () {
        return pull.values(expected)
      }
    }
  }

  var server = vas.listen(service, {}, {
    port: 7890,
    onListen: run
  })
  var client = vas.connect(service, {
    url: 'http://localhost:7890'
  })

  function run () {
    pull(
      client.people.find(),
      pull.collect(function (err, arr) {
        t.error(err)
        t.deepEqual(arr, expected)

        server.close(t.end)
      })
    )
  }
})
