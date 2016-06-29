var pull = require('../../').pull

module.exports = {
  name: 'things',
  version: '0.0.0',
  permissions: function (path, args) {},
  init: function (server, config) {
    return { find }

    function find () {
      return pull.values(config.data)
    }
  }
}
