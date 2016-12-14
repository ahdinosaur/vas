const asyncMap = require('pull-stream/throughs/async-map')

const adapter = {
  // receive method calls
  // send method responses
  server: (handler, options) => {
    return asyncMap(({ type, path, args }, cb) => {
      handler({ type, path, args, cb })
    })
  },
  // receive method calls
  // send method responses
  client: ({ server }) => {
    return server
  }
}

module.exports = {
  adapter
}
