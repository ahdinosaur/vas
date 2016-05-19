# chur

simple composable data services using [muxrpc](https://github.com/ssbc/muxrpc)

**work in progress**

```shell
npm install --save ahdinosaur/chur
```

for a user interface complement, see [`inu`](https://github.com/ahdinosaur/inu)

## example

see [./example](./example)

## usage

a `chur` service is a definition for a duplex stream that could respond to requests.

a `chur` service is defined by an object with the following keys:

- `name`: a string name
- `version` (optional): a string semantic version
- `manifest`: an object [muxrpc manifest](https://github.com/ssbc/muxrpc#manifest)
- `permissions`: an object [muxrpc permissions](https://github.com/ssbc/muxrpc#permissions)
- `init`: a `init(server, config)` pure function that returns an object of method functions to pass into [`muxrpc`](https://github.com/ssbc/muxrpc)
- `services`: any recursive sub-services of this one

### `chur = require('chur')`

the top-level `chur` module is a grab bag of all `chur/*` modules.

you can also require each module separately like `require('chur/createServer')`.

### `server = chur.createServer(service, config)`

a `chur` server is an instantiation of a service that responds to requests.

returns a `chur` server defined by an object with the following keys:

- `name`: a string name
- `version` (optional): a string semantic version
- `manifest`: an object [`muxrpc` manifest](https://github.com/ssbc/muxrpc#manifest)
- `permissions`: an object [`muxrpc` permissions](https://github.com/ssbc/muxrpc#permissions)
- `methods`: pure functions that are wrapped by [`muxrpc`](https://github.com/ssbc/muxrpc)
- `services`: any recursive services within this service

### `server.createStream()`

returns a [duplex pull stream](https://github.com/dominictarr/pull-stream-examples/blob/master/duplex.js) using [`muxrpc`](https://github.com/ssbc/muxrpc)

### `chur.listen(server, options)`

listens to a port and begins to handle requests from clients using [`pull-ws-server`](https://github.com/pull-stream/pull-ws-server)

### `chur.command(server, options)`

run a command on a server as a command-line interface using [`muxrpcli`](https://github.com/ssbc/muxrpcli)

### `client = chur.createClient(manifest, config)`

a `chur` client is a composition of manifests to makes requests.

- `name`: a string name
- `version` (optional): a string semantic version
- `manifest`: an object [muxrpc manifest](https://github.com/ssbc/muxrpc#manifest)
- `services`: any recursive services within this service

### `client.createStream()`

returns a [duplex pull stream](https://github.com/dominictarr/pull-stream-examples/blob/master/duplex.js) using [`muxrpc`](https://github.com/ssbc/muxrpc)

### `chur.connect(client, options)`

connects the client to a server over websockets using [`pull-ws-server`](https://github.com/pull-stream/pull-ws-server)

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
