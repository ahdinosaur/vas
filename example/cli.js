#!/usr/bin/env node

const vas = require('../')

const services = require('./services')
const config = require('./config')

const options = {
  port: config.port,
  url: config.url
}
vas.command(services, config, options, process.argv)
