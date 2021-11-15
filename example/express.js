const APM = require('../index')
const crypto = require('crypto')

const apm = new APM()
apm.init()

const app = require('express')()

// Declare a route
app.get('/test', async (request, res) => {
    const salt = crypto.randomBytes(128).toString('base64')
    const hash = crypto.pbkdf2Sync('myPassword', salt, 10000, 512, 'sha512')
    res.send({ hash })
})
app.listen(3000, () => {
    console.log('Server is listening ...')
})
