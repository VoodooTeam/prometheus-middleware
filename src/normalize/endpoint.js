'use strict'
const UrlValueParser = require('url-value-parser')

const normalizeEndpoint = function (endpointPath, extraMasks = [], placeholder = ':id') {
    const urlParser = new UrlValueParser({ extraMasks })
    return urlParser.replacePathValues(endpointPath.split('?')[0], placeholder)
}

module.exports = { normalizeEndpoint }
