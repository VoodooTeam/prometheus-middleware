const APM = require('../index')
const http = require('http')
const crypto = require('crypto')

const apm = new APM()
apm.init()

const requestListener = async (req, res) => {
    if (req.url === '/test') {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        const salt = crypto.randomBytes(128).toString('base64')
        const hash = crypto.pbkdf2Sync('myPassword', salt, 10000, 512, 'sha512')
        return res.end(hash)
    }
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('404 not found')
}

const server = http.createServer(requestListener)
server.listen(3000)
