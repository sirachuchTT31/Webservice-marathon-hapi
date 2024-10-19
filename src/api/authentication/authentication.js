const { PrismaClient } = require('@prisma/client');
const Boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateAccessToken, jwtDecode, generateRefreshToken, jwtVerifyRefreshToken } = require('../../utils/authentication.js')
const _ = require('underscore');
const baseResult = require('../../utils/response-base.js');
const baseModel = require('../../utils/response-model.js');
const prismaClient = new PrismaClient();
const httpResponse = require('../../constant/http-response.js');
const authenValidate = require('../validate/authen.validate');
const cryptLib = require('../../utils/crypt-lib.js')
const Constrat = require('../../constant/authentication-response.js')
const Response = require('../../constant/response.js')
const signIn = {
    tags: ['api'],
    description: 'Sign in',
    validate: {
        payload: authenValidate.signInValidate
    },
    auth: false,
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = authenValidate.signInValidate.validate(payload)
            if (!error) {
                const findAuthen = await prismaClient.users.findFirst({
                    where: {
                        username: value?.username
                    },
                    select: {
                        id: true,
                        password : true,
                        username: true,
                        lastname: true,
                        name: true,
                        access_status : true,
                        UserOnRole: {
                            select: {
                                Role: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            },
                        }
                    }
                })
                if (_.isEmpty(findAuthen)) {
                    baseModel.IBaseSingleResultModel = {
                        status: false,
                        status_code: httpResponse.STATUS_200.status_code,
                        message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง',
                        result: null
                    }
                    return reply.response(await baseResult.IBaseSingleResult(baseModel.IBaseSingleResultModel))
                }
                const password = findAuthen.password
                const passwordCompare = await bcrypt.compare(value.password, password)
                if (passwordCompare === true && findAuthen.access_status === 'Y') {
                    console.log('CHECK')
                    const payloadJWT = {
                        id: await cryptLib.encryptAES(findAuthen.id),
                        username: await cryptLib.encryptAES(findAuthen.username),
                        name: findAuthen.name,
                        lastname: findAuthen.lastname,
                        role: await cryptLib.encryptAES(findAuthen.UserOnRole[0].Role.name)
                    }
                    console.log(payloadJWT)
                    const token = await generateAccessToken(payloadJWT);
                    const refreshToken = await generateRefreshToken(payloadJWT);
                    const tokenDecode = await jwtDecode(token);
                    const t = await prismaClient.$transaction(async (tx) => {
                        const createLog = await tx.loginLog.create({
                            data: {
                                type_login: 'Normal Login',
                                user_id: findAuthen.id
                            },
                            select: {
                                id: true
                            }
                        });
                        return createLog.id ? createLog.id : null
                    })
                    baseModel.IBaseSingleResultModel = {
                        status: true,
                        status_code: httpResponse.STATUS_200.status_code,
                        message: 'Sign in successfully',
                        result: {
                            access_token: token,
                            refresh_token: refreshToken,
                            payload: tokenDecode,
                            authen_log_id: t
                        },
                    }
                    return reply.response(await baseResult.IBaseSingleResult(baseModel.IBaseSingleResultModel))
                }
                else {
                    baseModel.IBaseSingleResultModel = {
                        status: false,
                        status_code: httpResponse.STATUS_200.status_code,
                        message: 'Sign in failed',
                        result: null
                    }
                    return reply.response(await baseResult.IBaseSingleResult(baseModel.IBaseSingleResultModel))
                }
            }
            else {
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.error(e)
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const signOut = {
    auth: false,
    handler: async (request, reply) => {
        try {
            const payload = request.payload;
            const { value, error } = authenValidate.signOutValidate.validate(payload);
            if (!error) {
                let currentDate = new Date().toISOString()
                const t = await prismaClient.loginLog.update({
                    data: {
                        logout_time: currentDate
                    },
                    where: {
                        id: Number(value.authen_log_id)
                    }
                });
                if (!_.isEmpty(t)) {
                    baseModel.IBaseNocontentModel = {
                        status: true,
                        message: 'Update success',
                        status_code: httpResponse.STATUS_200.status_code,
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
                }
                else {
                    baseModel.IBaseNocontentModel = {
                        status: false,
                        message: 'Update fail',
                        status_code: httpResponse.STATUS_200.status_code,
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
                }
            }
            else {
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.log(e)
        }
    }
}

const refreshToken = {
    auth: false,
    handler: async (request, reply) => {
        try {
            const refreshToken = request.payload.refreshToken
            const responseRefreshToken = await jwtVerifyRefreshToken(refreshToken);
            let decodeUsername = await cryptLib.decryptAES(responseRefreshToken?.result?.username)
            if (responseRefreshToken.isValid != false) {
                const findAuthen = await prismaClient.users.findFirst({
                    where: {
                        username: decodeUsername
                    },
                    select: {
                        id: true,
                        username: true,
                        lastname: true,
                        name: true,
                        UserOnRole: {
                            select: {
                                Role: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            },
                        }
                    }
                });
                if (!_.isEmpty(findAuthen)) {
                    const payloadJWT = {
                        id: await cryptLib.encryptAES(findAuthen.id),
                        username: await cryptLib.encryptAES(findAuthen.username),
                        name: findAuthen.name,
                        lastname: findAuthen.lastname,
                        role: await cryptLib.encryptAES(findAuthen.UserOnRole[0].Role.name)
                    }
                    const accessToken = await generateAccessToken(payloadJWT, process.env.REFRESH_TOKEN_EXPIRATION);
                    const tokenDecode = await jwtDecode(accessToken);
                    baseModel.IBaseSingleResultModel = {
                        status: true,
                        status_code: httpResponse.STATUS_200.status_code,
                        message: 'Refresh token successfully',
                        result: {
                            access_token: accessToken,
                            refresh_token: refreshToken,
                            payload: tokenDecode,
                        },
                    }
                    return reply.response(await baseResult.IBaseSingleResult(baseModel.IBaseSingleResultModel))
                }
                return Constrat.unauthorized()
            }
            return Constrat.unauthorized()
        }
        catch (e) {
            console.error(e)
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const registerMembers = {
    auth: false,
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = authenValidate.registerValidate.validate(payload)
            if (!error) {
                const findDuplicates = await prismaClient.users.findFirst({
                    where: {
                        username: value.username,
                    }
                });
                if (_.isEmpty(findDuplicates)) {
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(value.password, salt);
                    const response = await prismaClient.users.create({
                        data: {
                            username: value.username,
                            password: hash,
                            name: value.name,
                            lastname: value.lastname,
                            email: value.email,
                            avatar: 'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Round&hairColor=BrownDark&facialHairType=BeardMedium&facialHairColor=BrownDark&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
                            access_status: 'Y',
                            UserOnRole: {
                                create: {
                                    role_id: 3,
                                }
                            }
                        }
                    })
                    // ]);
                    if (!_.isEmpty(response)) {
                        baseModel.IBaseNocontentModel = {
                            status: true,
                            status_code: httpResponse.STATUS_CREATED.status_code,
                            message: httpResponse.STATUS_CREATED.message,
                            error_message: '',
                        }
                        return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
                    }
                    baseModel.IBaseNocontentModel = {
                        status: false,
                        status_code: httpResponse.STATUS_500.status_code,
                        message: httpResponse.STATUS_500.message,
                        error_message: httpResponse.STATUS_500.message,
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
                }
                else {
                    baseModel.IBaseNocontentModel = {
                        status: false,
                        status_code: httpResponse.STATUS_400.status_code,
                        message: 'Invalid Duplicate Username',
                        error_message: httpResponse.STATUS_400.message,
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
                }

            }
            else {
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.error(e)
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const registerOrganizer = {
    auth: false,
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = authenValidate.registerValidate.validate(payload)
            if (!error) {
                const findDuplicates = await prismaClient.users.findFirst({
                    where: {
                        username: value.username,
                    }
                });
                if (_.isEmpty(findDuplicates)) {
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(value.password, salt);
                    const response = await prismaClient.users.create({
                        data: {
                            username: value.username,
                            password: hash,
                            name: value.name,
                            lastname: value.lastname,
                            email: value.email,
                            avatar: 'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Round&hairColor=BrownDark&facialHairType=BeardMedium&facialHairColor=BrownDark&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
                            access_status: 'Y',
                            UserOnRole: {
                                create: {
                                    role_id: 2
                                }
                            }
                        }
                    })
                    if (!_.isEmpty(response)) {
                        baseModel.IBaseNocontentModel = {
                            status: true,
                            status_code: httpResponse.STATUS_CREATED.status_code,
                            message: httpResponse.STATUS_CREATED.message,
                            error_message: '',
                        }
                        return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
                    }
                    baseModel.IBaseNocontentModel = {
                        status: false,
                        status_code: httpResponse.STATUS_500.status_code,
                        message: httpResponse.STATUS_500.message,
                        error_message: httpResponse.STATUS_500.message,
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
                }
                else {
                    baseModel.IBaseNocontentModel = {
                        status: false,
                        status_code: httpResponse.STATUS_400.status_code,
                        message: 'Invalid Duplicate Username',
                        error_message: httpResponse.STATUS_400.message,
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
                }
            }
            else {
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.error(e)
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

// const updateprofileMembers = {
//     handler: async (request, reply) => {
//         try {

//         }
//         catch (e) {

//         }
//     }
// }


module.exports = {
    signIn,
    signOut,
    refreshToken,
    registerMembers,
    registerOrganizer,
}