# Node.js simple agent

# Purpose

Agent to create an HTTP server to expose prometheus metrics.  
By default it:
- instantiates and returns a [prom-client](https://www.npmjs.com/package/prom-client)
- patch http server to get request response time
- allows to define custom metrics through prom-client

# Compatibility

Supported and tested : >= 14.0

| Version       | Supported     | Tested         |
|:-------------:|:-------------:|:--------------:|
| 14.x          | yes           | yes            |
| 16.x          | yes           | yes            |

# Installation

```console
$ npm install voodoo-apm --save
```

# Usage

## Basic
```javascript
const APM = require('voodoo-apm')
const apm = new APM()
apm.init()
```

## Add a custom metric
```javascript
TODO
```

# Debug

The agent use debug module in order not to pollute your logs.
If you want to see all agent output just use DEBUG environment variable:

```console
DEBUG=voodoo-apm* node myApp.js
```

# Test

```console
$ npm test
```

Coverage report can be found in coverage/.
