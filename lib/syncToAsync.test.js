var test = require('tape')

var toAsync = require('./syncToAsync')

test('is a function', function(t) {
  t.equal(typeof toAsync, 'function')
  t.end()
})

test('returns a function', function(t) {
  t.equal(typeof toAsync(function() {}), 'function')
  t.end()
})

test('calls back with result of function if function call ok', function(t) {
  var three = () => 3
  
  var asyncThree = toAsync(three)

  asyncThree(function(err, res) {
    t.error(err) 
    t.equal(res, three())
    t.end()
  })
})

test('calls back with error if function throws', function(t) {
  var throws = () => {throw new Error('Bang!')}
  
  var asyncThrows = toAsync(throws)

  asyncThrows(function(err, res) {
    t.equal(err.message, 'Bang!')
    t.end()
  })
})
