module.exports = walk

function walk (services, cb, path) {
  path = path || []

  if (!Array.isArray(services)) {
    services = [services]
  }

  services.forEach(function (service) {
    var name = service.name
    var servicePath = path.concat([name])

    cb(service, servicePath)

    if (service.services) {
      walk(service.services, cb, servicePath)
    }
  })
}
