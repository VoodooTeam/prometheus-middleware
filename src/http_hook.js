'use strict'
const Http = require('http')
const { normalizeEndpoint } = require('./normalize/endpoint')
const opentelemetry = require('@opentelemetry/api')

const init = function (client, config) {
    const opts = {
        histogram: {
            name: 'http_request_duration_seconds',
            help: 'request duration in seconds',
            labelNames: ['status', 'method', 'route'],
            enableExemplars: config.enableExemplars,
            buckets: config.HTTP_DURATION_BUCKETS || [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2]
        },
        summary: {
            name: 'http_request_summary_seconds',
            help: 'request duration in seconds summary',
            labelNames: ['status', 'method', 'route'],
            percentiles: config.HTTP_SUMMARY_PERCENTILES || [0.5, 0.9, 0.95, 0.99]
        }
    }

    const routeHist = new client.Histogram(opts.histogram)
    const routeSum = new client.Summary(opts.summary)

    const exemplarLabels = {}

    const emit = Http.Server.prototype.emit
    Http.Server.prototype.emit = function (type) {
        if (type === 'request') {
            const [req, res] = [arguments[1], arguments[2]]

            const start = process.hrtime()

            res.on('finish', () => {
                const url = new URL('http://' + req.headers.host + req.url)
                const urlPath = url.pathname
                const labels = {
                    method: req.method,
                    route: config.NORMALIZE_ENDPOINT ? normalizeEndpoint(req.url) : urlPath,
                    status: res.statusCode
                }

                if (res.statusCode === 404) {
                    labels.route = '/404' // avoid high cardinality in case of remote attack
                }

                const spanContext = opentelemetry.trace.getSpanContext(opentelemetry.context.active())
                const traceId = spanContext && spanContext.traceId
                exemplarLabels.traceID = traceId

                const delta = process.hrtime(start)
                const value = delta[0] + delta[1] / 1e9

                routeSum.observe(labels, value)

                if (config.enableExemplars) {
                    routeHist.observe({ labels, value, exemplarLabels })
                } else {
                    routeHist.observe(labels, value)
                }
            })
        }
        return emit.apply(this, arguments)
    }
}

module.exports = { init }
