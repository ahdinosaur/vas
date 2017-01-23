const vas = require('./')
const combine = require('depject')
const pull = require('pull-stream')
const Log = require('catstack-log')
const values = require('object-values')

const data = {
  gives: 'data',
  create: () => () => ({
    1: 'human',
    2: 'computer',
    3: 'JavaScript'
  })
}

const things = vas.Service({
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

    function get ({ id }, cb) {
      cb(null, data[id])
    }
  }
})

const modules = { data, things, Log }

module.exports = modules

if (!module.parent) {
  const api = vas.entry(combine(modules))

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
}
