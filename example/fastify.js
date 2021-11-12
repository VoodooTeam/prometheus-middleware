const APM = require('../index')
const crypto = require('crypto')

const apm = new APM()
apm.init()

const fastify = require('fastify')({ logger: true })

// Declare a route
fastify.get('/test', async (request, reply) => {
    const salt = crypto.randomBytes(128).toString('base64')
    const hash = crypto.pbkdf2Sync('myPassword', salt, 10000, 512, 'sha512')
    return { hash }
})
fastify.listen(3000)
