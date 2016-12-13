function authenticate (req, cb) {
  cb(null, null)
}

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
  authenticate,
  adapter
}
