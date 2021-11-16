'use strict'
const Http = require('http')

const init = function (client, config) {
    const opts = {
        histogram: {
            name: 'http_request_duration_seconds',
            help: 'request duration in seconds',
            labelNames: ['status', 'method', 'route'],
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

    const emit = Http.Server.prototype.emit
    Http.Server.prototype.emit = function (type) {
        if (type === 'request') {
            const [req, res] = [arguments[1], arguments[2]]

            const hist = routeHist.startTimer()
            const sum = routeSum.startTimer()

            res.on('finish', () => {
                const labels = {
                    method: req.method,
                    route: req.url,
                    status: res.statusCode
                }
                sum(labels)
                hist(labels)
            })
        }
        return emit.apply(this, arguments)
    }
}

module.exports = { init }
