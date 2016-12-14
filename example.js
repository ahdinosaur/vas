const { Server, Client, pull } = require('./')
const values = require('object-values')

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
  if (err) throw err
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
