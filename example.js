const { Service, Server, Client, pull } = require('./')
const values = require('object-values')

const serviceDefinition = {
  name: 'things',
  manifest: {
    all: 'source',
    get: 'async'
  },
  init: function (server, config) {
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

const { adapter } = require('./defaults')
const service = Service(serviceDefinition, config)
const server = Server(service, adapter.server)
const client = Client(service, adapter.client, { server })

client.things.get(1, (err, value) => {
  if(err) throw err
  console.log('get', value)
  // get human
})

pull(
  client.things.all(),
  pull.drain(v => console.log('all', v))
)
// all human
// all computer
// all JavaScript
