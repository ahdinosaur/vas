const { isArray } = Array

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
          ? mapService(services, cb)
          : null
      }
      )
  })
}

