module.exports = {
  root: __dirname,
  data: {
    things: {
      1: {
        id: 1,
        name: 'desk',
        description: 'clean and tidy, wait just kidding.'
      },
      2: {
        id: 1,
        name: 'vas',
        description: 'want continuous improvement, but need help.'
      }
    }
  },
  port: 5000,
  url: {
    protocol: 'ws',
    hostname: 'localhost',
    port: 5000
  }
}
