# vas [![stability][stability-badge]][stability-url]
[![npm version][version-badge]][version-url] [![test status][test-badge]][test-url] [![test coverage][coverage-badge]][coverage-url]
[![downloads][downloads-badge]][downloads-url] [![standard style][standard-badge]][standard-url]

simple composable data services using [muxrpc](https://github.com/ssbc/muxrpc)

```shell
npm install --save vas
```

for a user interface complement, see [`inu`](https://github.com/ahdinosaur/inu)

![human vasculatory system](https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Circulatory_System_no_tags.svg/259px-Circulatory_System_no_tags.svg.png)

## example

```js
var vas = require('./')
var pull = vas.pull
var values = require('object-values')

var service = {
  name: 'things',
  manifest: {
    all: 'source',
    get: 'async'
  },
  methods: function (server, config) {
    return { all, get }

    function all () {
      const things = values(config.data)
      return pull.values(things)
    }

    function get (id, cb) {
      cb(null, config.data[id])
    }
  },
  permissions: function (server, config) {
    return { get }

    function get (id) {
      if (id === 'nobody') {
        return new Error('nobody is not allowed.')
      }
    }
  },
  handlers: function (server, config) {
    return [
      function (req, res, next) {
        console.log('cookie:', req.headers.cookie)
        next()
      }
    ]
  }
}

// could also attach db connection, file descriptors, etc.
var config = {
  data: {
    1: 'human',
    2: 'computer',
    3: 'JavaScript'
  }
}

var port = 6000
var url = `ws://localhost:${port}`
var server = vas.listen(service, config, { port })
var client = vas.connect(service, config, { url })

client.things.get(1, (err, value) => {
  if(err) throw err
  console.log('get', value)
  // get human
})

pull(
  client.things.all(),
  pull.drain(v => console.log('all', v))
)
// all human
// all computer
// all JavaScript

setTimeout(function () {
  server.close()
  client.close()
}, 1000)
```

for a more complete example, see [./example](./example).

## usage

a `vas` service is a definition for a duplex stream that could respond to requests.

a `vas` service is defined by an object with the following keys:

- `name`: a string name
- `version` (optional): a string semantic version
- `manifest`: an object [muxrpc manifest](https://github.com/ssbc/muxrpc#manifest)
- `methods`: a `methods(server, config)` pure function that returns an object of method functions to pass into [`muxrpc`](https://github.com/ssbc/muxrpc)
- `permissions`: a `permissions(server, config)` pure function that returns an object of permission functions which correspond to methods. each permission function accepts the same arguments as the method and can return an optional `new Error(...)` if the method should not be called.
- `handlers` a `handlers(server, config)` pure function that returns an array of http request handler functions, each of shape `(req, res, next) => { next() }`.
- `services`: any recursive sub-services

in either a method, permission, or handler function: `this.id` corresponds to a shared value to set and get for each connection. (_hint_: auth)

many `vas` services can refer to a single service or an `Array` of services

### `vas = require('vas')`

the top-level `vas` module is a grab bag of all `vas/*` modules.

you can also require each module separately like `require('vas/createServer')`.

### `server = vas.createServer(services, config)`

a `vas` server is an instantiation of a service that responds to requests.

`createServer` returns an object that corresponds to the (recursive) services and respective methods returned by `methods`.

### `server.createStream()`

returns a [duplex pull stream](https://github.com/dominictarr/pull-stream-examples/blob/master/duplex.js) using [`muxrpc`](https://github.com/ssbc/muxrpc)

### `client = vas.createClient(services, config)`

a `vas` client is a composition of manifests to makes requests.

`createClient` returns an object that corresponds to the (rescursive) services and respective methods in `manifest`.

### `client.createStream()`

returns a [duplex pull stream](https://github.com/dominictarr/pull-stream-examples/blob/master/duplex.js) using [`muxrpc`](https://github.com/ssbc/muxrpc)

### `vas.listen(services, config, options)`

creates a server with `createServer(services, config)`, then

listens to a port and begins to handle requests from clients using [`pull-ws-server`](https://github.com/pull-stream/pull-ws-server)

`options` is an object with the following (optional) keys:

- `port`: port to open WebSocket server
- `onListen`: function to call once server is listening

### `vas.connect(client, config, options)`

creates a client with `createClient(services, config)`, then

connects the client to a server over websockets using [`pull-ws-server`](https://github.com/pull-stream/pull-ws-server)

`options` is an object with the following (optional) keys:

- `url`: string or [object](https://nodejs.org/api/url.html#url_url_strings_and_url_objects) to refer to WebSocket server
- `onConnect`: function to call once client is connected

### `vas.command(services, config, options, argv)`

run a command on a server as a command-line interface using [`muxrpcli`](https://github.com/ssbc/muxrpcli)

`options` are either those passed to `vas.listen` or `vas.connect`, depending on if `argv[0] === 'server'`

`argv` is expected to be `process.argv`.

## frequently asked questions (FAQ)

### how to reduce browser bundles

by design, service definitions are re-used between client and server creations.

this leads to all the server code being included in the browser, when really we only need the service names and manifests to create the client.

to reduce our bundles to only this information (eliminating any `require` calls or other bloat in our service files), use the [`evalify`](https://github.com/ahdinosaur/evalify) browserify transform.

to [`evalify`](https://github.com/ahdinosaur/evalify) only service files, where service files are always named  `service.js`, install `evalify` and add the following to your `package.json`

```json
{
  "browserify": {
    "transform": [
      ["evalify", { "files": ["**/service.js"] } ]
    ]
  }
}
```

## inspiration

- [`big`](https://jfhbrook.github.io/2013/05/28/the-case-for-a-nodejs-framework.html)
- [`feathers`](http://feathersjs.com/)
- [`secret-stack`](https://github.com/ssbc/secret-stack)

## license

The Apache License

Copyright &copy; 2016 Michael Williams

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

[stability-badge]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[stability-url]: https://nodejs.org/api/documentation.html#documentation_stability_index
[version-badge]: https://img.shields.io/npm/v/vas.svg?style=flat-square
[version-url]: https://npmjs.org/package/vas
[test-badge]: https://img.shields.io/travis/ahdinosaur/vas/master.svg?style=flat-square
[test-url]: https://travis-ci.org/ahdinosaur/vas
[coverage-badge]: https://img.shields.io/codecov/c/github/ahdinosaur/vas/master.svg?style=flat-square
[coverage-url]: https://codecov.io/github/ahdinosaur/vas
[downloads-badge]: http://img.shields.io/npm/dm/vas.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/vas
[standard-badge]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: https://github.com/feross/standard
