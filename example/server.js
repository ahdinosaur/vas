var vas = require('../')

var services = require('./services')
var config = require('./config')

var ws = vas.listen(services, config)
