const vas = require('./')
const pull = require('pull-stream')
const values = require('object-values')

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
const services = definitions.map(vas.Service)
const api = vas.Emitter(vas.combine(services))

api.things.get(1, (err, value) => {
  if (err) throw err
  console.log('get', value)
  // get human
})

pull(
  api.things.all(),
  pull.drain(v => console.log('all', v))
)
// all human
// all computer
// all JavaScript
