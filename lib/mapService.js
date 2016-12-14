const { isArray } = Array

const is = require('./is')

module.exports = mapService

function mapService (services, cb) {
  if (!isArray(services)) {
    services = [services]
  }

  return services.map(service => {
    const { name, services } = service
    return Object.assign(
      {},
      cb(service),
      {
        name,
        services: services
          ? mapServices(services, cb)
          : null
      }
      )
  })
}

