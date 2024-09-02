const APM = require('../index')

describe('prom-client integration', () => {
    let apm

    afterEach(() => {
        apm.destroy()
    })

    it('should report metrics by default', async () => {
        apm = new APM()
        apm.init()
        const data = await apm.client.register.metrics()
        expect(data.includes("process_cpu_user_seconds_total")).toEqual(true)
    });

    it('should support turning off default collection', async () => {
        apm = new APM({ COLLECT_DEFAULT_METRICS: false })
        apm.init()
        const data = await apm.client.register.metrics()
        expect(data.includes("process_cpu_user_seconds_total")).toEqual(false)
    });

    it('should use custom config for prom', async () => {
        apm = new APM({
            PROM_CLIENT_CONF: {
                prefix: 'myApp_'
            }
        })
        apm.init()
        const data = await apm.client.register.metrics()
        expect(data.indexOf('TYPE myApp_process_cpu_user_seconds counter') > -1).toEqual(true)
    })
})
