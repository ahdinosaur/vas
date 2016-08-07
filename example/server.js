const vas = require('../')

const services = require('./services')
const config = require('./config')

const port = config.port
vas.listen(services, config, { port })

console.log(`server listening on port ${port}.`)
