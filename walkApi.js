module.exports = function walkApi (api, cb, path) {
  path = path || []
  Object.keys(api).forEach(function (name) {
    var service = api[name]
    var servicePath = path.concat([name])
    cb(service, servicePath)
    if (service.services) {
      walkApi(service.services, cb, servicePath)
    }
  })
}
