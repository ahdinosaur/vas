const test = require('tape')
const pull = require('pull-stream')
const values = require('object-values')

const { Server/*, Client */, combine, Emitter } = require('./')

test('vas exports Server, Client, start, combine, and Emitter functions', function (t) {
  t.equal(typeof Server, 'function', 'Server is a function')
  // t.equal(typeof Client, 'function', 'Client is a function')
  t.equal(typeof combine, 'function', 'combine is a function')
  t.equal(typeof Emitter, 'function', 'Emitter is a function')
  t.end()
})

test('hello world example works', function (t) {
  t.plan(4)

  const data = {
    1: 'human',
    2: 'computer',
    3: 'JavaScript'
  }

  const things = {
    path: ['things'],
    manifest: {
      all: 'source',
      get: 'async'
    },
    methods: {
      all: function () {
        const things = values(data)
        return pull.values(things)
      },
      get: function ({ id }, cb) {
        cb(null, data[id])
      }
    }
  }

  const definitions = [things]
  const services = definitions.map(Server)
  const api = Emitter(combine(services))

  api.things.get({ id: 1 }, (err, value) => {
    t.error(err)
    t.equal(value, data[1])
  })

  pull(
    api.things.all(),
    pull.collect((err, arr) => {
      t.error(err)
      t.equal(arr.length, 3)
    })
  )
})
