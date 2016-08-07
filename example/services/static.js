const fs = require('fs')
const { join } = require('path')
const browserify = require('browserify')

module.exports = {
  name: 'static',
  version: '1.0.0',
  handlers: function (server, config) {
    return [
      function (req, res, next) {
        if (req.url === '/bundle.js') {
          const entry = join(config.root, 'browser.js')
          browserify(entry)
            .transform('evalify', { files: '**/services/*.js' })
            .bundle()
            .pipe(res)
        } else next()
      },
      function (req, res, next) {
        if (req.url === '/') {
          const index = join(config.root, 'index.html')
          fs.createReadStream(index)
            .pipe(res)
        }
      }
    ]
  }
}
