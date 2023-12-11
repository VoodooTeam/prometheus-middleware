const debug = require('debug')
const error = debug('prometheus-middleware:error')
const client = require('prom-client')
const http = require('http')

const HTTPHook = require('./src/http_hook')
let METRICS_ROUTE = '/metrics'

client.register.setContentType(
    client.Registry.OPENMETRICS_CONTENT_TYPE
)

const requestListener = async (req, res) => {
    if (req.url === METRICS_ROUTE) {
        try {
            const data = await client.register.metrics()
            res.writeHead(200, { 'Content-Type': client.register.contentType })
            return res.end(data)
        } catch (ex) {
            error(ex)
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
        if (!Object.prototype.hasOwnProperty.call(config, 'HTTPHook')) {
            config.HTTPHook = true
        }
        if (!Object.prototype.hasOwnProperty.call(config, 'enableExemplars')) {
            config.enableExemplars = true
        }
    }

    init () {
        METRICS_ROUTE = this.config.METRICS_ROUTE || METRICS_ROUTE
        // --------------------------------------------------------------
        // Create HTTP hook
        // --------------------------------------------------------------
        if (this.config.HTTPHook) HTTPHook.init(this.client, this.config)

        // --------------------------------------------------------------
        // prometheus stuff
        // --------------------------------------------------------------
        this.config.NORMALIZE_ENDPOINT = this.config.NORMALIZE_ENDPOINT === undefined ? true : this.config.NORMALIZE_ENDPOINT
        const collectDefaultMetrics = this.client.collectDefaultMetrics
        collectDefaultMetrics(this.config.PROM_CLIENT_CONF)
        this.server = http.createServer(requestListener)
        this.server.listen(this.config.PORT || 9350)
    }

    destroy () {
        this.server.close()
        this.client.register.clear()
    }
}

module.exports = APM
