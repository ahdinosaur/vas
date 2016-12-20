const test = require('tape')

const { Server, Client, pull } = require('./')
const values = require('object-values')

test('vas exports Server, Client and pull functions', function (t) {
  t.equal(typeof Server, 'function', 'Server is a function')
  t.equal(typeof Client, 'function', 'Client is a function')
  t.equal(typeof pull, 'function', 'pull is a function')
  t.end()
})

test('hello world example works', function (t) {
  t.plan(4)
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
        const things = values(config.data)
        return pull.values(things)
      }

      function get (id, cb) {
        cb(null, config.data[id])
      }
    }
  }

  // could also attach db connection, file descriptors, etc.
  const config = {
    data: {
      1: 'human',
      2: 'computer',
      3: 'JavaScript'
    }
  }

  const server = Server(service, config)
  const client = Client(service, config)

  pull(client, server, client)

  client.things.get(1, (err, value) => {
    t.error(err)
    t.equal(value, config.data[1])
  })

  pull(
    client.things.all(),
    pull.collect((err, arr) => {
      t.error(err)
      t.equal(arr.length, 3)
    })
  )
})
