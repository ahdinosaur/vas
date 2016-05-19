var minimist = require('minimist')
var muxrpcli = require('muxrpcli')

var listen = require('./listen')

module.exports = command

function command (server) {
  //get config as cli options after --, options before that are
  //options to the command.
  var argv = process.argv.slice(2)
  var i = argv.indexOf('--')
  var conf = argv.slice(i+1)
  argv = ~i ? argv.slice(0) : argv

  //var config = require('ssb-config/inject')(process.env.ssb_appname, minimist(conf))
  var config = minimist(conf)


  if (argv[0] == 'server') {
    // special server command:
    // start the server
    listen(server, config)
  } else {
    // normal command:
    // create a client connection to the server

    // connect
    connect(server.manifest, config, function (client) {
      if(err) {
        if (/could not connect/.test(err.message)) {
          console.log('Error: Could not connect to the server.')
          console.log('Use the "server" command to start it.')
          if(config.verbose) throw err
          process.exit(1)
        }
        throw err
      }

      // run commandline flow
      muxrpcli(argv, server, config.verbose)
    })
  }
}
