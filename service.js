const assign = require('object-assign')

const Module = require('./lib/module')
const Methods = require('./lib/methods')
const mapManifest = require('./lib/mapManifest')

module.exports = Service

function Service (definition) {
  // normalize manifest
  definition = assign({}, definition, {
    manifest: mapManifest(definition.manifest)
  })
  const { manifest, create } = definition
  return Module(assign({}, definition, {
    create: function (api) {
      const { methods, hooks } = create(api)
      return Methods({ manifest, methods, hooks })
    }
  }))
}
