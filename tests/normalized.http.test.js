const APM = require('../index')
const { httpRequest } = require('./utils/httpRequest')

describe('normalize', () => {
    let apm
    let app
    beforeAll(async () => {
        apm = new APM()
        apm.init()

        app = require('fastify')()

        // Declare a route
        app.get('/test', async (request, reply) => {
            reply.send('OK')
        })
        // Declare a route
        app.get('/test/:id', async (request, reply) => {
            reply.send('OK')
        })
        await app.listen({ port: 3000 })
    })

    afterAll(async () => {
        await apm.destroy()
        await app.close()
    })

    it('should expose http response time', async () => {
        for (let i = 0; i < 10; i++) {
            await httpRequest('http://localhost:3000/test')
        }

        const data = await httpRequest('http://localhost:9350/metrics')
        expect(data.indexOf('http_request_duration_seconds_count{method="GET",route="/test",status="200"} 10') > -1).toEqual(true)
    })

    it('should expose http response time without ids', async () => {
        for (let i = 0; i < 10; i++) {
            await httpRequest('http://localhost:3000/test/1234')
        }

        const data = await httpRequest('http://localhost:9350/metrics')
        expect(data.indexOf('http_request_duration_seconds_count{method="GET",route="/test/:id",status="200"} 10') > -1).toEqual(true)
    })

    it('should expose http response time without query parameters', async () => {
        for (let i = 0; i < 10; i++) {
            await httpRequest('http://localhost:3000/test/1234?thisQueryParameter=value')
        }

        const data = await httpRequest('http://localhost:9350/metrics')
        expect(data.indexOf('http_request_duration_seconds_count{method="GET",route="/test/1234?thisQueryParameter=value",status="200"} 10') === -1).toEqual(true)
    })
})
