[![GitHub release](https://img.shields.io/npm/v/prometheus-middleware.svg)](https://github.com/VoodooTeam/prometheus-middleware/releases/)
[![GitHub license](https://img.shields.io/github/license/VoodooTeam/prometheus-middleware.svg)](https://github.com/VoodooTeam/prometheus-middleware/blob/master/LICENSE)
[![CI pipeline](https://github.com/VoodooTeam/prometheus-middleware/workflows/Node.js%20CI/badge.svg)](https://github.com/VoodooTeam/prometheus-middleware/actions?query=workflow%3A%22Node.js+CI%22)
[![Opened issues](https://img.shields.io/github/issues-raw/VoodooTeam/prometheus-middleware.svg)](https://github.com/VoodooTeam/prometheus-middleware/issues)
[![Opened PR](https://img.shields.io/github/issues-pr-raw/VoodooTeam/prometheus-middleware.svg)](https://github.com/VoodooTeam/prometheus-middleware/pulls)
[![Code coverage](https://codecov.io/gh/VoodooTeam/prometheus-middleware/branch/master/graph/badge.svg)](https://codecov.io/gh/VoodooTeam/prometheus-middleware)
[![Node version](https://img.shields.io/node/v-lts/prometheus-middleware.svg)](https://github.com/VoodooTeam/prometheus-middleware)

# Node.js simple middleware to expose Prometheus metrics

# Purpose

Module to create an HTTP server to expose Prometheus metrics.  
By default it:
- runs an HTTP server to expose metrics
- instantiates and returns a [prom-client](https://www.npmjs.com/package/prom-client)
- patches http server to get request response time
- allows to define custom metrics through prom-client

# Compatibility

Supported and tested : >= 14.0

| Version       | Supported     | Tested         |
|:-------------:|:-------------:|:--------------:|
| 16.x          | yes           | yes            |
| 18.x          | yes           | yes            |
| 20.x          | yes           | yes            |

It works with different HTTP servers:
- [default Node.js HTTP server](https://nodejs.org/api/http.html#class-httpserver)
- [express](https://expressjs.com/)
- [fastify](https://www.fastify.io/)

By default you can access your metrics on this endpoint: http://localhost:9350/metrics

In order to handle remote attack and to avoid high cardinality, the default behavior of this lib is to
override the `path` label in case of HTTP code 404.

# Installation

```console
$ npm install prometheus-middleware --save
```

# Usage

## Basic
```javascript
const APM = require('prometheus-middleware')
const apm = new APM()
apm.init()
```

## Add a custom metric
```javascript
const APM = require('prometheus-middleware')
const apm = new APM()
apm.init()
// ----------------
const counter = new apm.client.Counter({
  name: 'metric_name',
  help: 'metric_help',
})
// ----------------
counter.inc(); // Increment by 1
counter.inc(10); // Increment by 10
```

The metrics system is exactly the same as in [prom-client](https://www.npmjs.com/package/prom-client) librairy.

## Configuration

The config is an JSON object which accepts the following property:

```javascript
const APM = require('prometheus-middleware')
const apm = new APM({
  METRICS_ROUTE: "/metrics",
  PORT: 9350,
  PROM_CLIENT_CONF: {},
  HTTP_DURATION_BUCKETS: [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2]
  HTTP_SUMMARY_PERCENTILES: [0.5, 0.9, 0.95, 0.99]
  NORMALIZE_ENDPOINT: false,
})
apm.init()
```

## Destroy the APM
If you use a graceful exit method or if you want to simply stop the APM, you should run:

```javascript
const APM = require('prometheus-middleware')
const apm = new APM()
apm.init()

process.on('SIGTERM', () => {
  apm.destroy()
})
```

| Property                  | Default                                 | Description                                                 |
|:--------------------------|:----------------------------------------|:------------------------------------------------------------|
| METRICS_ROUTE             | /metrics                                | Route to expose the metrics                                 |
| PORT                      | 9350                                    | Port to listen metrics                                      |
| PROM_CLIENT_CONF          | {}                                      | Configuration of the prom-client lib                        |
| HTTP_DURATION_BUCKETS     | [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2] | List of values for HTTP request duration                    |
| HTTP_SUMMARY_PERCENTILES  | [0.5, 0.9, 0.95, 0.99]                  | List of values for HTTP request percentiles                 | 
| NORMALIZE_ENDPOINT        | true                                    | Normalize endpoint by occulting ids, and query parameters   | 

To see how to use the module you can refer to the [example folder](https://github.com/VoodooTeam/prometheus-middleware/tree/master/example).

# Debug

The agent use debug module in order not to pollute your logs.
If you want to see all agent output just use DEBUG environment variable:

```console
DEBUG=prometheus-middleware* node myApp.js
```

# Test

```console
$ npm test
```

Coverage report can be found in coverage/.
