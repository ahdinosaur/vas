var vas = require('../')
// var pull = vas.pull

var services = require('./services')
var config = require('./config')

vas.command(services, config, process.argv)
