const getInService = require('./getInService')

const services = [{
  name: 'things',
  manifest: {
    create: 'async'
  },
  methods: {
    create: function (obj, cb) {}
  },
  hooks: {
    create: []
  }
}]

console.log(getInService(services, ['things', 'create']))
