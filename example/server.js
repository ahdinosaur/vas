var vas = require('../')

var services = require('./services')
var config = require('./config')

vas.listen(services, config)
