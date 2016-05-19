var chur = require('../')

var service = require('./service')
var config = require('./config')

var server = chur.createServer(service)

listen(server, config)
