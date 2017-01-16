const Log = require('pino')

module.exports = {
  needs: {
    config: {
      log: {
        level: 'first',
        stream: 'first'
      }
    }
  },
  gives: {
    config: {
      log: {
        level: true,
        stream: true
      }
    },
    log: true
  },
  create: (api) => {
    var log
    return {
      config: {
        log: {
          level: () => 'info',
          stream: () => process.stdout
        }
      },
      log: (level, a, b, c, d, e, f, g, h, i, j) => {
        if (log === undefined) {
          const { level, stream } = api.config.log
          log = Log({ level: level() }, stream())
        }
        log[level](a, b, c, d, e, f, g, h, i, j)
        return true
      }
    }
  }
}
