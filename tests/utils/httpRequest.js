const http = require('http')

module.exports.httpRequest = (params) => {
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
