const APM = require('../index')
const crypto = require('crypto')

const apm = new APM()
apm.init()

const fastify = require('fastify')()

// Slow route
fastify.get('/slow', async (request, reply) => {
    const salt = crypto.randomBytes(128).toString('base64')
    const hash = crypto.pbkdf2Sync('myPassword', salt, 10000, 512, 'sha512')
    return { hash }
})

// fast route
fastify.get('/fast', async (request, reply) => {
    return {}
})
fastify.listen(3000)

// you can now load test this API
// and then get metrics on http:localhost:9350/metrics
