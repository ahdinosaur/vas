const pull = require('../../').pull

module.exports = {
  name: 'things',
  version: '1.0.0',
  manifest: {
    getSync: 'sync',
    getAsync: 'async',
    find: 'source',
    log: 'sink'
  },
  methods: function (server, config) {
    const things = config.data.things

    return {
      getSync: getSync,
      getAsync: getAsync,
      find: find,
      log: log
    }

    function getSync (options) {
      return things[options.id]
    }

    function getAsync (options, cb) {
      cb(null, things[options.id])
    }

    function find () {
      return pull.values(values(things))
    }

    function log () {
      return pull.log()
    }
  }
}

function values (obj) {
  return Object.keys(obj)
    .reduce((sofar, key) => {
      return sofar.concat([obj[key]])
    }, [])
}
