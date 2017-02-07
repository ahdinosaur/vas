const { isArray } = Array

const Emitter = require('./Emitter')
const combine = require('./combine')

module.exports = start

function start (Type, definitions = []) {
  if (!isArray(definitions)) definitions = [definitions]
  const services = definitions.map(Type)
  const { manifest, handler } = combine(services)
  return Emitter({ manifest, handler })
}
