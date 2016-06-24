# vas

simple composable data services using [muxrpc](https://github.com/ssbc/muxrpc)

**work in progress**

```shell
npm install --save ahdinosaur/vas
```

for a user interface complement, see [`inu`](https://github.com/ahdinosaur/inu)

![human vasculatory system](https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Circulatory_System_no_tags.svg/259px-Circulatory_System_no_tags.svg.png)

## example

see [./example](./example)

## usage

a `vas` service is a definition for a duplex stream that could respond to requests.

a `vas` service is defined by an object with the following keys:

- `name`: a string name
- `version` (optional): a string semantic version
- `manifest`: an object [muxrpc manifest](https://github.com/ssbc/muxrpc#manifest)
- `permissions`: an object [muxrpc permissions](https://github.com/ssbc/muxrpc#permissions)
- `init`: a `init(server, config)` pure function that returns an object of method functions to pass into [`muxrpc`](https://github.com/ssbc/muxrpc)
- `services`: any recursive sub-services of this one

### `vas = require('vas')`

the top-level `vas` module is a grab bag of all `vas/*` modules.

you can also require each module separately like `require('vas/createServer')`.

### `server = vas.createServer(service, config)`

a `vas` server is an instantiation of a service that responds to requests.

returns a `vas` server defined by an object with the following keys:

- `name`: a string name
- `version` (optional): a string semantic version
- `manifest`: an object [`muxrpc` manifest](https://github.com/ssbc/muxrpc#manifest)
- `permissions`: an object [`muxrpc` permissions](https://github.com/ssbc/muxrpc#permissions)
- `methods`: pure functions that are wrapped by [`muxrpc`](https://github.com/ssbc/muxrpc)
- `services`: any recursive services within this service

### `server.createStream()`

returns a [duplex pull stream](https://github.com/dominictarr/pull-stream-examples/blob/master/duplex.js) using [`muxrpc`](https://github.com/ssbc/muxrpc)

### `vas.listen(server, options)`

listens to a port and begins to handle requests from clients using [`pull-ws-server`](https://github.com/pull-stream/pull-ws-server)

### `vas.command(server, options)`

run a command on a server as a command-line interface using [`muxrpcli`](https://github.com/ssbc/muxrpcli)

### `client = vas.createClient(manifest, config)`

a `vas` client is a composition of manifests to makes requests.

- `name`: a string name
- `version` (optional): a string semantic version
- `manifest`: an object [muxrpc manifest](https://github.com/ssbc/muxrpc#manifest)
- `services`: any recursive services within this service

### `client.createStream()`

returns a [duplex pull stream](https://github.com/dominictarr/pull-stream-examples/blob/master/duplex.js) using [`muxrpc`](https://github.com/ssbc/muxrpc)

### `vas.connect(client, options)`

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
