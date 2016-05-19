const test = require('tape')

const chur = require('../')

test('chur', function(t) {
  t.ok(chur, 'module is require-able')
  t.end()
})
