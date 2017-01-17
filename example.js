const { Service, combine, pull } = require('./')
const values = require('object-values')

const data = {
  gives: 'data',
  create: () => () => ({
    1: 'human',
    2: 'computer',
    3: 'JavaScript'
  })
}

const things = Service({
  name: 'things',
  needs: {
    data: 'first'
  },
  manifest: {
    all: 'source',
    get: 'async'
  },
  create: function (api) {
    const data = api.data()

    return {
      methods: { all, get }
    }

    function all () {
      const things = values(data)
      return pull.values(things)
    }

    function get (id, cb) {
      cb(null, data[id])
    }
  }
})

const services = { things }

// const api = combine(services, driver, { data })
const api = combine(services, { data })

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
