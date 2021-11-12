'use strict'
const AsyncHooks = require('async_hooks')
const Http = require('http')
const { performance, PerformanceObserver } = require('perf_hooks')

const context = new Map()

const emit = Http.Server.prototype.emit
Http.Server.prototype.emit = function (type) {
    if (type === 'request') {
        const [req, res] = [arguments[1], arguments[2]]

        const id = AsyncHooks.executionAsyncId()
        req.apm = { uuid: id, url: req.url, method: req.method, startDate: new Date(), startTime: 0, duration: 0, actions: [] }

        performance.mark(`start-${req.apm.uuid}`)

        res.on('finish', () => {
            performance.mark(`end-${req.apm.uuid}`)
            performance.measure(`request-${req.apm.uuid}`, `start-${req.apm.uuid}`, `end-${req.apm.uuid}`)

            performance.clearMarks(`start-${req.apm.uuid}`)
            performance.clearMarks(`end-${req.apm.uuid}`)
            // PerfHook.performance.clearMeasures(`request-${req.apm.uuid}`)
        })

        context.set(id, req)
    }
    return emit.apply(this, arguments)
}

const obs = new PerformanceObserver((perfObserverList, observer) => {
    perfObserverList.getEntries().forEach((entry) => {
        const id = entry.name.replace('request-', '')
        const req = getContext(Number(id))
        req.apm.duration = entry.duration
        req.apm.startTime = entry.startTime
        console.log(req.apm.duration)
    })
    // observer.disconnect()
})
obs.observe({ entryTypes: ['measure'] })

const init = function (asyncId, type, triggerAsyncId) {
    if (context.has(triggerAsyncId)) {
        context.set(asyncId, context.get(triggerAsyncId))
    }
}

const destroy = function (asyncId) {
    if (context.has(asyncId)) {
        context.delete(asyncId)
    }
}

const getContext = function (asyncId = AsyncHooks.executionAsyncId()) {
    return context.get(asyncId)
}

module.exports = { init, destroy, getContext }
