<h1 align="center">
  <img
    alt="human vasculatory system"
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Circulatory_System_no_tags.svg/259px-Circulatory_System_no_tags.svg.png"
    height="300"
  />
  <br />
  vas
</h1>

<h4 align="center">
  :seedling: composable client/server data services using <a href="https://pull-stream.github.io">pull streams</a>
</h4>

<div align="center">
  <!-- stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square" alt="stability" />
  </a>
  <!-- npm version -->
  <a href="https://npmjs.org/package/vas">
    <img src="https://img.shields.io/npm/v/vas.svg?style=flat-square" alt="npm version" />
  </a>
  <!-- build status -->
  <a href="https://travis-ci.org/ahdinosaur/vas">
    <img src="https://img.shields.io/travis/ahdinosaur/vas/master.svg?style=flat-square" alt="build status" />
  </a>
  <!-- test coverage -->
  <a href="https://codecov.io/github/ahdinosaur/vas">
    <img src="https://img.shields.io/codecov/c/github/ahdinosaur/vas/master.svg?style=flat-square" alt="test coverage" />
  </a>
  <!-- downloads -->
  <a href="https://npmjs.org/package/vas">
    <img src="https://img.shields.io/npm/dm/vas.svg?style=flat-square" alt="downloads" />
  </a>
  <!-- standard style -->
  <a href="https://github.com/feross/standard">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square" alt="standard style" />
  </a>
</div>

<details>
  <summary>table of contents</summary>
  <li><a href="#features">features</a></li>
  <li><a href="#demos">demos</a></li>
  <li><a href="#example">example</a></li>
  <li><a href="#concepts">concepts</a></li>
  <li><a href="#usage">usage</a></li>
  <li><a href="#install">install</a></li>
  <li><a href="#inspiration">inspiration</a></li>
</details>


## features

- **API is a data structure**: easy to understand and simple to extend
- **functional**: services are just objects and functions, no magic
- **fractal**: compose one API from many smaller APIs
- **database-agnostic**: create API services on top of anything
- **hookable**: hook before, after, and around methods 
- **adaptable**: use adapters to transport over http, websockets
- [**omakse**](https://youtu.be/E99FnoYqoII): consistent flavoring with [pull streams](https://pull-streams.github.io) all the way down

for a user interface complement, see [`inu`](https://github.com/ahdinosaur/inu)

## demos

TODO

*if you want to share anything using `vas`, add your thing here!*

## example

```js
const { Server, Client, pull } = require('vas')
const values = require('object-values')

const service = {
  name: 'things',
  manifest: {
    all: 'source',
    get: 'async'
  },
  init: function (config) {
    return {
      methods: { all, get }
    }

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
const config = {
  data: {
    1: 'human',
    2: 'computer',
    3: 'JavaScript'
  }
}

const server = Server(service, config)
const client = Client(service, config)
  
pull(client, server, client)

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
```

for a more complete example, see [./example](./example), which you can run with `npm run example` and query using command-line using `npm run example:cli -- things.find`.

## concepts

let's say we're writing a todo app (so lame right).

we want to be able to get all the todo items, update a todo item, and add another one.

if we think of these _methods_ as functions, it might look like this (using [knex](http://knexjs.org/)):

```js
const toPull = require('stream-to-pull-stream')
const Db = require('knex')

const db = Db({
  client: 'sqlite3',
  connection: {
    filename: './mydb.sqlite'
  }
})

const methods = {
  getAll,
  update,
  add
}

function getAll () {
  return toPull(db('todos').select().stream())
}

function update (nextTodo, cb) {
  db('todos')
    .where('id', nextTodo.id)
    .update(nextTodo)
    .asCallback(cb)
}

function add (todo, cb) {
  db('todos').insert(todo).asCallback(cb)
}
```

what if we could call these functions directly from the front-end?

to do so, we need to specify which functions are available and of what type they are, which is called a _manifest_.

```js
const manifest = {
  getAll: 'source',
  update: 'async',
  add: 'async'
}
```

where 'source' corresponds to a [source pull stream](https://github.com/pull-stream/pull-stream) and 'async' corresponds to a function that receives an error-first callback.

this manifest provides us with enough information to construct a mirrored function on the client:

```js
pull(
  getAll(),
  pull.log()
)
```

together, this could become a _service_, complete with a name and version:

```js
const service = {
  name: 'todos',
  version: '1.0.0',
  manifest,
  methods
}
```

what if we had multiple services that need to share some configuration, such as a single database connection?

to do so, we want to pass a _config_ object to the service methods, in particular a function that receives the config and returns the method functions.

combine these concepts together and welcome to `vas`. :)

## usage

a `vas` service is a definition for a duplex stream that responds to requests.

a `vas` service is defined by an object with the following keys:

- `name`: a string name
- `version` (optional): a string semantic version
- `manifest`: a manifest object mapping method names to strings representing the method type (`sync`, `async`, `source`, or `sink`)
- `init`: a `(config, topService) => ({ methods, hooks })` pure function that returns
  - `methods`: method functions.
  - `hooks`: hooks which correspond to methods. each hook is an tuple of shape `[type, fn]`, where `type` is either [`around`, `before`, or `after`](https://github.com/ahdinosaur/aspects) and `fn` is an asynchronous function that accepts the same arguments as the method (and an additional callback if the method is not `async`).
- `services`: any recursive sub-services

a `vas` service can refer to a single service or an `Array` of services

### `vas = require('vas')`

the top-level `vas` module is a grab bag of all `vas/*` modules.

you can also require each module separately like `require('vas/server')`.

### `vas.Server(service, config)`

creates a `vas` server from the service definition and any arbitrary config object (which will be passed into any sub-service `.init()` function).

a `server` is a duplex pull-stream where:

- `sink`: receives request objects `{ path, args, req }`
- `source`: sends response objects `{ type, value, error, stream, res }` with `value` or `error` is a callback method or `stream` is a stream method.

### `vas.Client(service, config)`

creates a `vas` client from the service definition and any arbitrary config object (which will be passed into any sub-service `.init()` function).

a `client` is a duplex pull-stream where:

- `source`: sends request objects `{ path, args, req }`
- `sink`: receives response objects `{ type, value, error, stream, res }` with `value` or `error` is a callback method or `stream` is a stream method.

### `vas.pull(client, server, client)`

`pull` is equivalent to `require('pull-stream')`.

using `pull(client, server, client)` connects the client and server duplex streams together.

## adapters

TODO

### `vas.http.listen(options)`

returns a duplex stream to receive and send `vas` method responses and requests as http messages.

### `vas.http.connect(options)`

returns a duplex stream to send and receive `vas` method requests and responses as http messages.

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

### how to do authentication

TODO: re-write for v3

authentication is answers the question of _who you are_.

here's an example of how to do this in `vas`, stolen stolen from [`holodex/app/dex/user/service`](https://github.com/holodex/app/blob/master/dex/user/service.js):

(where `config.tickets` corresponds to an instance of [`ticket-auth`](https://github.com/dominictarr/ticket-auth))

```js
const Route = require('http-routes')

const service = {
  name: 'user',
  manifest: {
    whoami: 'sync'
  },
  authenticate: function (server, config) {
    return (req, cb) => {
      config.tickets.check(req.headers.cookie, cb)
    }
  },
  methods: function (server, config) {
    return { whoami }

    function whoami () {
      return this.id
    }
  },
  handlers: (server, config) => {
    return [
      Route([
        // redeem a user ticket at /login/<ticket> and set cookie.
        ['login/:ticket', function (req, res, next) {
          config.tickets.redeem(req.params.ticket, function (err, cookie) {
            if(err) return next(err)
            // ticket is redeemed! set it as a cookie, 
            res.setHeader('Set-Cookie', cookie)
            res.setHeader('Location', '/') // redirect to the login page.
            res.statusCode = 303
            res.end()
          })
        }],
        // clear cookie.
        ['logout', function (req, res, next) {
          res.setHeader('Set-Cookie', 'cookie=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;')
          res.setHeader('Location', '/') // redirect to the login page.
          res.statusCode = 303
          res.end()
        }],
        // return current user. (for debugging)
        ['whoami', function (req, res, next) {
          res.end(JSON.stringify(req.id) + '\n')
        }]
      ])
    ]
  }
}
```

## install

```shell
npm install --save vas
```

## inspiration

- [`big`](https://jfhbrook.github.io/2013/05/28/the-case-for-a-nodejs-framework.html)
- [`feathers`](http://feathersjs.com/)
- [`muxrpc`](https://github.com/ssbc/muxrpc)
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
