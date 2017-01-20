const combine = require('depject')
const values = require('object-values')
const pull = require('pull-stream')
const vas = require('../')

const http = require('./')
const example = require('../example')

const things = vas.Service({
  name: 'things',
  needs: {
    data: 'first'
  },
  manifest: {
    all: {
      type: 'source',
      http: {
        route: '/things',
        statusCode: 418,
        responseHeaders: {
          'cat': 'meow'
        }
      }
    },
    get: {
      type: 'async',
      http: {
        route: '/things/:id'
      }
    }
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

const { data, vasModules } = example
const combinedModules = combine({ data, vasModules, things, http })

combinedModules.vas.start.map(start => start())
