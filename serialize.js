var Serializer = require('pull-serializer')

module.exports = serialize

function serialize (stream) {
  return Serializer(stream, JSON, { split: '\n\n' })
}
