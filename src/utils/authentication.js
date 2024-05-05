const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode')
const _ = require('underscore');
const jwtVerify = async (token, access_token_secret) => {
    try {
        let response = {}
        let err = null
        jwt.verify(token, access_token_secret, {
            algorithms: ['HS256']
        }, function (err, res) {
            response = res ? res : {}
            err = err
        });

        if (err) {
            console.log('jwt middleware error')
        }
        return {
            isValid: err ? false : true,
            result: response
        }
    }
    catch (e) {
        return {
            isValid: false,
            result: {}
        }
    }
}

const jwtDecode = async (token) => {
    try {
        const payloadDecode = jwt_decode.jwtDecode(token)
        return payloadDecode ? payloadDecode : null
    }
    catch (e) {

    }
}
module.exports = {
    jwtVerify,
    jwtDecode
}