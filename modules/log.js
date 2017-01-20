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
      log: () => {
        if (log === undefined) {
          const { level, stream } = api.config.log
          log = Log({
            level: level()
          }, stream())
        }
        return log
      }
    }
  }
}
