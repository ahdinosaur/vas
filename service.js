const assign = require('object-assign')

const Module = require('./lib/module')
const Methods = require('./lib/methods')

module.exports = Service

function Service (definition) {
  const { manifest, create } = definition
  return Module(assign(definition, {
    create: function (api) {
      const { methods, hooks } = create(api)
      return Methods({ manifest, methods, hooks })
    }
  }))
}
