const muxrpcli = require('muxrpcli')

const listen = require('./listen')
const connect = require('./connect')

module.exports = command

function command (services, config, options, argv) {
  const args = argv.slice(2)
  if (args[0] === 'server') {
    // special server command:
    // start the server
    options.onListen = onListen
    return listen(services, config, options)
  } else {
    // normal command:
    // create a client connection to the server
    options.onConnect = onConnect
    var client = connect(services, config, options)
    return client
  }

  function onListen (err) {
    if (err) throw err
    console.log(`server listening at ws://localhost:${options.port}`)
  }

  function onConnect (err, ws) {
    if (err) {
      if (err.code === 'ECONNREFUSED') {
        console.log(`Error: Could not connect to the server at ${err.target.url}.`)
        console.log('Use the "server" command to start it.')
        if (options.verbose) throw err
        process.exit(1)
      }
      throw err
    }

    // run commandline flow
    muxrpcli(args, client.manifest, client, options.verbose)
  }
}
