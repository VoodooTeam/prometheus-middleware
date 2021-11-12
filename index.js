const client = require('prom-client')
const http = require('http')

const AsyncHooks = require('async_hooks')

const Context = require('./context')

const hook = AsyncHooks.createHook({
    init (asyncId, type, triggerAsyncId) {
        Context.init(asyncId, type, triggerAsyncId)
    },
    destroy (asyncId) {
        // destroy everything in map/array to prevent memory leak
        Context.destroy(asyncId)
    }
})

hook.enable()

const requestListener = async (req, res) => {
    if (req.url === '/metrics') {
        try {
            res.writeHead(200, { 'Content-Type': client.register.contentType })
            return res.end(await client.register.metrics())
        } catch (ex) {
            console.log(ex)
            res.writeHead(500, { 'Content-Type': 'text/html' })
            return res.end('Error')
        }
    }
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('404 not found')
}

class APM {
    constructor (config = {}) {
        this.config = config
        this.client = client
        this.server = null
    }

    init () {
        const collectDefaultMetrics = client.collectDefaultMetrics
        collectDefaultMetrics()
        this.server = http.createServer(requestListener)
        this.server.listen(this.config.PORT || 9050)
    }

    destroy () {
        this.server.close()
        hook.disable()
    }
}

module.exports = APM
