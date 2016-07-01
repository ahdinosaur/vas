const minimist = require('minimist')
const muxrpcli = require('muxrpcli')

const listen = require('./listen')
const connect = require('./connect')

module.exports = command

function command (service, config, argv) {
  // get config as cli config after --, config before that are
  // config to the command.
  argv = argv.slice(2)
  const i = argv.indexOf('--')
  const configArgs = argv.slice(i + 1)
  argv = ~i ? argv.slice(0) : argv

  Object.assign(config, minimist(configArgs))
  console.log('config', config)

  if (argv[0] === 'server') {
    // special server command:
    // start the server
    console.log('starting server')
    listen(service, config)
  } else {
    // normal command:
    // create a client connection to the server

    // connect
    connect(service, config, function (err, client) {
      console.log('client', client)
      if (err) {
        if (/could not connect/.test(err.message)) {
          console.log('Error: Could not connect to the server.')
          console.log('Use the "server" command to start it.')
          if (config.verbose) throw err
          process.exit(1)
        }
        throw err
      }

      // run commandline flow
      muxrpcli(argv, client.manifest, client, config.verbose)
    })
  }
}
