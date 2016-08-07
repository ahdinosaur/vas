const pull = require('../../').pull

module.exports = {
  name: 'things',
  version: '1.0.0',
  manifest: {
    find: 'source'
  },
  methods: function (server, config) {
    return { find: find }

    function find () {
      const things = values(config.data.things)
      return pull.values(things)
    }
  }
}

function values (obj) {
  return Object.keys(obj)
    .reduce((sofar, key) => {
      return sofar.concat([obj[key]])
    }, [])
}
