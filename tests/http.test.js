const APM = require('../index')
const { httpRequest } = require('./utils/httpRequest')

describe('retry', () => {
    let apm
    let app
    beforeAll(async () => {
        apm = new APM({
            NORMALIZE_ENDPOINT: false
        })
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

    it('should expose http response time with id in the endpoint', async () => {
        for (let i = 0; i < 10; i++) {
            await httpRequest('http://localhost:3000/test/1234')
        }

        const data = await httpRequest('http://localhost:9350/metrics')
        expect(data.indexOf('http_request_duration_seconds_count{method="GET",route="/test/1234",status="200"} 10') > -1).toEqual(true)
    })

    it('should expose http response time with query parameters', async () => {
        for (let i = 0; i < 10; i++) {
            await httpRequest('http://localhost:3000/test/1234?thisQueryParameter=value')
        }

        const data = await httpRequest('http://localhost:9350/metrics')
        expect(data.indexOf('http_request_duration_seconds_count{method="GET",route="/test/1234",status="200"} 20') > -1).toEqual(true)
    })

    it('should handle 404', async () => {
        try {
            await httpRequest('http://localhost:3000/unknown')
        } catch (err) {
            expect(err.message).toEqual('statusCode=404')
            const data = await httpRequest('http://localhost:9350/metrics')
            expect(data.indexOf('http_request_duration_seconds_count{method="GET",route="/404",status="404"}') > -1).toEqual(true)
        }
    })

    it('should return 404', async () => {
        try {
            await httpRequest('http://localhost:9350/unknown')
            throw new Error('This test should have thrown an error !!!!')
        } catch (err) {
            expect(err.message).toEqual('statusCode=404')
        }
    })

    it('should return 500', async () => {
        apm.client.register.metrics = () => { return new Promise((resolve, reject) => { reject(new Error('error')) }) }
        try {
            await httpRequest('http://localhost:9350/metrics')
            throw new Error('This test should have thrown an error !!!!')
        } catch (err) {
            expect(err.message).toEqual('statusCode=500')
        }
    })
})
