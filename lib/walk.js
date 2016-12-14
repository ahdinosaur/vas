const isArray = Array.isArray

module.exports = walk

function walk (services, cb, path = []) {
  if (!isArray(services)) {
    services = [services]
  }

  services.forEach(function (service) {
    const { name, services } = service
    const servicePath = path.concat([name])

    cb(service, servicePath)

    if (services) {
      walk(services, cb, servicePath)
    }
  })
}
