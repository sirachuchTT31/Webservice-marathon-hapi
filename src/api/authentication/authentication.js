const { PrismaClient } = require('@prisma/client');
const Boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('underscore');
const baseResult = require('../../utils/response-base.js');
const baseModel = require('../../utils/response-model.js');
const prismaClient = new PrismaClient();
const httpResponse = require('../../constant/http-response.js');
const { signInValidate } = require('../validate/authen.validate');


const signIn = {
    auth : false,
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = signInValidate.validate(payload)
            if (!error) {
                const findAuthen = await prismaClient.tb_authentications.findFirst({
                    where: {
                        username: value?.username
                    }
                })
                const password = findAuthen.password
                const passwordCompare = await bcrypt.compare(value.password, password)
                if (passwordCompare === true && findAuthen.access_status === 'Y') {
                    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { algorithm: 'HS256', expiresIn: 600000000000 })
                    baseModel.IBaseSingleResultModel = {
                        status: true,
                        status_code: httpResponse.STATUS_200.status_code,
                        message: 'Sign in successfully',
                        result: {
                            token: token,
                            payload: payload,
                            time_out_token: 600000000000
                        },
                    }
                    return reply.response(await baseResult.IBaseSingleResult(baseModel.IBaseSingleResultModel))
                }
                else {
                    baseModel.IBaseSingleResultModel = {
                        status: false,
                        status_code: httpResponse.STATUS_500.status_code,
                        message: 'Sign in failed',
                        result: null
                    }
                    return reply.response(await baseResult.IBaseSingleResult(baseModel.IBaseSingleResultModel))
                }
            }
        }
        catch (e) {
            console.error(e)
            Boom.badImplementation()
        }
    }
}

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

module.exports = {
    signIn,
    jwtVerify
}