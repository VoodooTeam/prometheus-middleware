const APM = require('../index')

describe('retry', () => {
    let apm

    afterAll(() => {
        apm.destroy()
    })

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
