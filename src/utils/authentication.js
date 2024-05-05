const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode')
const _ = require('underscore');

const generateAccessToken = async (payload, expiresToken) => {
    try {
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,
            {
                algorithm: 'HS256',
                expiresIn: expiresToken ? expiresToken : process.env.ACCESS_TOKEN_EXPIRATION
            });
        return accessToken ? accessToken : null
    }
    catch (e) {
        console.log(e)
    }
}
const generateRefreshToken = async (payload) => {
    try {
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET,
            {
                algorithm: 'HS256',
                expiresIn: process.env.REFRESH_TOKEN_EXPIRATION
            });
        return refreshToken ? refreshToken : null
    }
    catch (e) {
        console.log(e)
    }
}

const jwtVerifyRefreshToken = async (refreshToken) => {
    try {
        let response = {}
        let error = null;
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, {
            algorithms: ['HS256']
        }, function (err, res) {
            response = res ? res : {};
            error = err
        })
        if (error) {
            console.log('jwt refresh middleware error',error)
            return {
                isValid : false ,
                result : {

                }
            }
        }
        return {
            isValid : error ? false  : true ,
            result: {
                ...response
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}

const jwtVerify = async (token, access_token_secret) => {
    try {
        let response = {}
        let error = null
        jwt.verify(token, access_token_secret, {
            algorithms: ['HS256']
        }, function (err, res) {
            response = res ? res : {}
            error = err
        });

        if (error) {
            console.log('jwt middleware error',error)
            return {
                isValid: false,
                result: {}
            }
        }
        return {
            isValid: error ? false : true,
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
    generateAccessToken,
    generateRefreshToken,
    jwtVerify,
    jwtVerifyRefreshToken,
    jwtDecode
}