# dev-server

Simple and fast dev-server with live-reloading.\
Serves and watches one or multiple folders, reloads html on file changes.

DO NOT use this in production, dev-server is meant only as a tool for developing your code.

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
	- [startServer](#startserver)
	- [DevServerOptions](#devserveroptions)
	- [DevServerResult](#devserverresult)

## Installation
`npm install --save-dev @kilcekru/dev-server`

## Usage
```javascript
import { startServer } from "@kilcekru/dev-server";

const server = await startServer({
	root: "./public", // required; directory to serve
	port: 8080, // required; server port
	host: "localhost", // address to bind to
	delay: 200, // delay in ms after file change before reload
	injectCss: true, // inject css changes instead of reloading
	reloadOnReconnect: false, // Reload html when dev-server is restarted
	chrootRefresh: false, // Refresh html only on changes in the same or a sub-directory
	hashFiles: false, // prevent reloads if file change has same content
});

// address the server is listening on
console.log(server.address);

// you can manually stop the server
await server.stop();

```

## API

### startServer
```javascript
startServer(options: DevServerOptions): Promise<DevServerResult>;
```

### DevServerOptions
#### `root` (required)
Path of a directory that contains the files to serve.\
Non-absolute paths are interpreted relative to current working directory.

Multiple roots can be given as `Record<mountPath, directoryPath>`.
- mountPath: Url the directory will be mounted on
- directoryPath: Path to directory

Multiple roots are independent; a change in root will not reload html served from another root.

#### `port` (required)

HTTP port the dev-server listens on.\
Setting port to 0 will use a random unused port.

#### `host`

Type: `string`\
Default: `localhost`

Host adress to bind to.

#### `delay`

Type: `number`\
Default: `100`

Time in ms to wait after file change before refreshing.\
Very small values might trigger reloads before file write is finished.

#### `injectCss`

Type: `boolean`\
Default: `true`

Don't reload on changes in css files, instead refresh only stylesheets.\
Only works if css files are included with `<link rel="stylesheet">` in html.

#### `reloadOnReconnect`

Type: `boolean`\
Default: `false`

Reload html when dev-server is restarted.

#### `chrootRefresh`

Type: `boolean`\
Default: `false`

Refresh html only on changes in the same or a sub-directory.\
This is usefull to serve multiple independent webapps in folders next to each other.

#### `hashFiles`

Type: `boolean`\
Default: `false`

When a file changes compare the file hash to the version before.\
This prevents a refresh when a file has been written with the same content.\
e.g. esbuild will write every file on every build.

This will increase CPU load especially if a lot of files are watched.

### DevServerResult

#### `address`

Type: `string`

Address dev-server is listening on.

#### `stop`

Type: `() => Promise<void>`

Function to close the dev-server.\
Returns a Promise that resolves when the server is closed.