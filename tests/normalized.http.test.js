const APM = require('../index')
const http = require('http')

const httpRequest = (params) => {
    return new Promise((resolve, reject) => {
        const req = http.request(params, (res) => {
            // reject on bad status
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('statusCode=' + res.statusCode))
            }
            // cumulate data
            let body = []
            res.on('data', (chunk) => {
                body.push(chunk)
            })
            // resolve on end
            res.on('end', () => {
                try {
                    body = Buffer.concat(body).toString()
                } catch (e) {
                    reject(e)
                }
                resolve(body)
            })
        })
        // reject on request error
        req.on('error', (err) => {
            reject(err)
        })
        // IMPORTANT
        req.end()
    })
}

describe('normalize', () => {
    let apm
    let app
    beforeAll((done) => {
        apm = new APM({
            NORMALIZE_ENDPOINT: true
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
        app.listen(3000, () => {
            done()
        })
    })

    afterAll(() => {
        apm.destroy()
        app.close()
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
        console.log(data)
        expect(data.indexOf('http_request_duration_seconds_count{method="GET",route="/test/#value",status="200"} 10') > -1).toEqual(true)
    })

    it('should expose http response time without query parameters', async () => {
        for (let i = 0; i < 10; i++) {
            await httpRequest('http://localhost:3000/test/1234?thisQueryParameter=value')
        }

        const data = await httpRequest('http://localhost:9350/metrics')
        console.log(data)
        expect(data.indexOf('http_request_duration_seconds_count{method="GET",route="/test/1234?thisQueryParameter=value",status="200"} 10') === -1).toEqual(true)
    })
})
