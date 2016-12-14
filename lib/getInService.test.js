const test = require('tape')

const getInService = require('./getInService')

test('getInService', t => {
  const services = [{
    name: 'things',
    manifest: {
      create: 'async'
    },
    methods: {
      create: function (obj, cb) {
        cb(null, obj)
      }
    },
    hooks: {
      create: []
    }
  }]
  const expected = {
    name: 'create',
    type: 'async',
    fn: services[0].methods.create,
    hooks: []
  }
  const actual = getInService(services, ['things', 'create'])
  t.deepEqual(actual, expected, 'getIn things.create is correct')
  t.end()
})
