const _ = require('underscore')
const bcrypt = require('bcrypt');
const { PrismaClient, Prisma } = require('@prisma/client')
const prismaClient = new PrismaClient();
const baseResult = require('../../utils/response-base.js');
const baseModel = require('../../utils/response-model.js')
const Boom = require('@hapi/boom')
const httpResponse = require('../../constant/http-response.js')
const { createAdminValidate } = require('../validate/admin.validate.js')
//FIXME: Admin
const createAdmin = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = createAdminValidate.validate(payload)
            console.log(error)
            if (!error) {
                const findDuplicates = await prismaClient.tb_admins.findFirst({
                    where: {
                        admin_username: value.admin_username
                    }
                })
                if (_.isEmpty(findDuplicates)) {
                    let math = Math.random() * 10000000
                    let newMath = Math.ceil(math);
                    let _id = "ADMIN" + String(newMath);
                    let salt = await bcrypt.genSalt(10);
                    let hash = await bcrypt.hash(value.admin_password, salt)
                    const bodyAdmin = {
                        admin_id: _id,
                        admin_username: payload.admin_username,
                        admin_password: hash,
                        admin_name: payload.admin_name,
                        admin_lastname: payload.admin_lastname,
                        admin_tel: payload.admin_tel,
                        admin_address: payload.admin_address,
                        admin_email: payload.admin_email,
                        admin_avatar: payload.admin_avatar,
                        admin_status: 'N',
                        role: "admin",
                    }
                    const bodyAuthen = {
                        auth_id: bodyAdmin.admin_id,
                        username: bodyAdmin.admin_username,
                        password: bodyAdmin.admin_password,
                        name: bodyAdmin.admin_name,
                        lastname: bodyAdmin.admin_lastname,
                        avatar: bodyAdmin.admin_avatar,
                        access_status : 'N',
                        role: bodyAdmin.role,
                    }
                    const t = await prismaClient.$transaction([
                        prismaClient.tb_admins.create({
                            data : bodyAdmin
                        }),
                        prismaClient.tb_authentications.create({
                            data : bodyAuthen
                        })
                    ])
                    console.log(t)
                    if(!_.isEmpty(t)){
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
                baseModel.IBaseNocontentModel = {
                    status: false,
                    status_code: httpResponse.STATUS_400.status_code,
                    message: httpResponse.STATUS_400.message,
                    error_message: httpResponse.STATUS_400.message,
                }
                return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
            }
        }
        catch (e) {
            console.log(e)
            Boom.badImplementation()
        }
    }
}
const getAllAdmin = {
    handler: async (request, reply) => {
        try {
            const findAll = await prismaClient.tb_admins.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            })
            if (!_.isEmpty(findAll)) {
                baseModel.IBaseCollectionResultsModel = {
                    status: true,
                    status_code: httpResponse.STATUS_200.status_code,
                    message: httpResponse.STATUS_200.message,
                    results: findAll
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
            else {
                baseModel.IBaseCollectionResultsModel = {
                    status: true,
                    status_code: httpResponse.STATUS_500.message,
                    message: httpResponse.STATUS_500.message,
                    results: []
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
        }
        catch (e) {
            Boom.badImplementation()
        }
    }
}

module.exports = {
    createAdmin,
    getAllAdmin
}