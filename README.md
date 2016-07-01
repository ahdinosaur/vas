# vas [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

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
  init: function (server, config) {
    return { all, get }

    function all () {
      const things = values(config.data)
      return pull.values(things)
    }

    function get (id, cb) {
      cb(null, config.data[id])
    }
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
- `permissions`: an object [muxrpc permissions](https://github.com/ssbc/muxrpc#permissions)
- `init`: a `init(server, config)` pure function that returns an object of method functions to pass into [`muxrpc`](https://github.com/ssbc/muxrpc)
- `services`: any recursive sub-services

many `vas` services can refer to a single service or an `Array` of services

### `vas = require('vas')`

the top-level `vas` module is a grab bag of all `vas/*` modules.

you can also require each module separately like `require('vas/createServer')`.

### `server = vas.createServer(services, config)`

a `vas` server is an instantiation of a service that responds to requests.

`createServer` returns an object that corresponds to the (recursive) services and respective methods returned by `init`.

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

### TODO `vas.command(services, config, argv)`

_not implemented yet_

run a command on a server as a command-line interface using [`muxrpcli`](https://github.com/ssbc/muxrpcli)

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

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/vas.svg?style=flat-square
[3]: https://npmjs.org/package/vas
[4]: https://img.shields.io/travis/ahdinosaur/vas/master.svg?style=flat-square
[5]: https://travis-ci.org/ahdinosaur/vas
[6]: https://img.shields.io/codecov/c/github/ahdinosaur/vas/master.svg?style=flat-square
[7]: https://codecov.io/github/ahdinosaur/vas
[8]: http://img.shields.io/npm/dm/vas.svg?style=flat-square
[9]: https://npmjs.org/package/vas
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
