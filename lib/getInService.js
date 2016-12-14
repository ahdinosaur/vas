const { isArray } = Array
const getIn = require('get-in')

module.exports = getInService

function getInService (services, path) {
  if (!isArray(services)) {
    const service = services
    if (path.length === 1) {
      const name = path[0]
      return {
        name,
        type: getIn(service, ['manifest', name]),
        fn: getIn(service, ['methods', name]),
        hooks: getIn(service, ['hooks', name])
      }
    }
    return getInService(service.services, path)
  }

  const [nextName, ...nextPath] = path

  for (var i = 0; i < services.length; i++) {
    const service = services[i]
    if (service.name === nextName) {
      return getInService(service, nextPath)
    }
  }
}
