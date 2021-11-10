[![GitHub release](https://img.shields.io/npm/v/node-health-agent.svg)](https://github.com/wallet77/node-health-agent/releases/)
[![GitHub license](https://img.shields.io/github/license/wallet77/node-health-agent)](https://github.com/wallet77/node-health-agent/blob/master/LICENSE)
[![CI pipeline](https://github.com/wallet77/node-health-agent/workflows/Node.js%20CI/badge.svg)](https://github.com/wallet77/node-health-agent/actions?query=workflow%3A%22Node.js+CI%22)
[![Code coverage](https://codecov.io/gh/wallet77/node-health-agent/branch/master/graph/badge.svg)](https://codecov.io/gh/wallet77/node-health-agent)
[![Opened issues](https://img.shields.io/github/issues-raw/wallet77/node-health-agent)](https://github.com/wallet77/node-health-agent/issues)
[![Opened PR](https://img.shields.io/github/issues-pr-raw/wallet77/node-health-agent)](https://github.com/wallet77/node-health-agent/pulls)
[![DeepScan grade](https://deepscan.io/api/teams/12061/projects/15018/branches/292503/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=12061&pid=15018&bid=292503)
[![Dependencies updates](https://img.shields.io/david/wallet77/node-health-agent.svg)](https://github.com/wallet77/node-health-agent)
[![Dependencies updates](https://img.shields.io/david/dev/wallet77/node-health-agent.svg)](https://github.com/wallet77/node-health-agent)
[![Node version](https://img.shields.io/node/v-lts/node-health-agent.svg)](https://github.com/wallet77/node-health-agent)

# Node agent for Node health project.

# Purpose

Agent to trigger events in your instances (even on production).
It comes with a list of built-in events and allows to trigger custom actions.

# Compatibility

**/!\ This module use async/await syntax and the inspector module, this is why you must have node 8.0+.**

Supported and tested : >= 8.0

| Version       | Supported     | Tested         |
|:-------------:|:-------------:|:--------------:|
| 14.x          | yes           | yes            |
| 12.x          | yes           | yes            |

**In order to have all features we recommend to use at least Node.js version 10 or higher.**

# Installation

```console
$ npm install node-health-agent --save
```

# Usage

## Basic
```javascript
const agent = require('node-health-agent')({
  appName: 'testAPI',
  serverUrl: 'ws://localhost:3001',
  inspector: {
    storage: {
      type: "s3",
      bucket: process.env.CONFIG_S3_BUCKET,
      dir: 'inspector'
    }
  }
})

```

## Add a custom event
```javascript
agent.addEvent('myEvent', (event) => {
  console.log(event)
})
```

### Add a custom event and send data to server
```javascript
agent.addEvent('myEvent', (event, ws) => {
  const data = ... // get data in any way
  event.data = data
  ws.send(JSON.stringify(event))
})
```

### Trigger event manually
```javascript
agent._events.cpu_profiling_start({}, agent.ws, agent.inspector)
// ...
// a few moment later
const profile = await agent._events.cpu_profiling_stop({}, agent.ws, agent.inspector)
```


# List of built-in events

| Event                        | description                                |
|:----------------------------:|:------------------------------------------:|
| `cpu_profiling_start`        | Start a CPU profiling                      |
| `cpu_profiling_stop`         | Stop a CPU profiling                       |
| `extract_env_var`            | Extract environment variables              |
| `extract_package_file`       | Extract package.json file content          |
| `extract_dependencies`       | Extract the full dependencies tree         |
| `memory_dump`                | Take a memory snapshot                     |
| `memory_sampling_start`      | Start a memory sampling                    |
| `memory_sampling_stop`       | Stop memory sampling                       |
| `code_coverage_start`        | Start to collect code coverage data        |
| `code_coverage_stop`         | Stop code coevrage and send data           |
| `diagnosis_report`           | Run Node.js diagnosis report               |
| `memory_cpu_usage`           | Export CPU and memory info                 |

# Debug

Node-health's agent use debug module in order not to pollute your logs.
If you want to see all agent output just use DEBUG environment variable:

```console
DEBUG=node-health-agent* node myApp.js
```

# Test

```console
$ npm test
```

Coverage report can be found in coverage/.
