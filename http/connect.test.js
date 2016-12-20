const test = require('tape')
const pull = require('pull-stream')
const MockXMLHttpRequest = require('mock-xmlhttprequest')

global.XMLHttpRequest = MockXMLHttpRequest

const Connection = require('./connect')

test.skip('async request', t => {
  const connection = Connection()

  global.XMLHttpRequest.onSend = (xhr) => {
    t.equal(xhr.method, 'POST')
    t.equal(xhr.url, '/things/get')
    t.deepEqual(xhr.headers, {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
    t.equal(xhr.body, JSON.stringify([0], null, 2))
    xhr.respond(200, {
      'Content-Type': 'application/json'
    }, JSON.stringify({
      value: {
        id: 0,
        name: 'computer'
      }
    }, null, 2))
  }

  pull(
    pull.values([
      {
        type: 'async',
        path: ['things', 'get'],
        args: [0]
      }
    ]),
    connection.sink
  )

  pull(
    connection.source,
    pull.drain(response => {
      t.deepEqual(response, {
        type: 'async',
        path: ['things', 'get'],
        args: [0],
        value: {
          id: 0,
          name: 'computer'
        }
      })
      t.end()
    })
  )
})
