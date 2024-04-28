const _ = require('underscore')
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client')
const prismaClient = new PrismaClient();
const baseResult = require('../../utils/response-base.js');
const baseModel = require('../../utils/response-model.js')
const Boom = require('@hapi/boom')
const httpResponse = require('../../constant/http-response.js')
const validateAdmin = require('../validate/admin.validate.js')
const validateMasterData = require('../validate/master-data.validate.js')

//FIXME: Admin
const createAdmin = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateAdmin.createAdminValidate.validate(payload)
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
                        access_status: 'N',
                        role: bodyAdmin.role,
                    }
                    const t = await prismaClient.$transaction([
                        prismaClient.tb_admins.create({
                            data: bodyAdmin
                        }),
                        prismaClient.tb_authentications.create({
                            data: bodyAuthen
                        })
                    ])
                    if (!_.isEmpty(t)) {
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

const updateAdmin = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateAdmin.updateAdminValidate.validate(payload)
            if (!error) {
                const t = await prismaClient.$transaction([
                    prismaClient.tb_admins.update({
                        where: {
                            admin_id: value.admin_id
                        },
                        data: {
                            admin_name: value.admin_name ? value.admin_name : '',
                            admin_lastname: value.admin_lastname ? value.admin_lastname : '',
                            admin_tel: value.admin_tel ? value.admin_tel : '',
                            admin_address: value.admin_address ? value.admin_address : '',
                            admin_email: value.admin_email ? value.admin_email : '',
                            admin_avatar: value.admin_avatar ? value.admin_avatar : '',
                        }
                    }),
                    prismaClient.tb_authentications.update({
                        where: {
                            auth_id: value.admin_id
                        },
                        data: {
                            name: value.admin_name ? value.admin_name : '',
                            lastname: value.admin_lastname ? value.admin_lastname : '',
                            avatar: value.admin_avatar ? value.admin_avatar : '',
                        }
                    })
                ]);
                if (!_.isEmpty(t)) {
                    baseModel.IBaseNocontentModel = {
                        status: true,
                        status_code: httpResponse.STATUS_CREATED.status_code,
                        message: 'Updated successfully',
                        error_message: '',
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel));
                }
                else {
                    baseModel.IBaseNocontentModel = {
                        status: false,
                        status_code: httpResponse.STATUS_400.status_code,
                        message: 'Updated failed',
                        error_message: httpResponse.STATUS_400.message,
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel));
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
            console.error(e);
            Boom.badImplementation()
        }
    }
}

const deleteAdmin = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateAdmin.deleteAdminValidate.validate(payload)
            if (!error) {
                const t = await prismaClient.$transaction([
                    prismaClient.tb_admins.delete({
                        where : {
                            admin_id : value.admin_id
                        }
                    }),
                    prismaClient.tb_authentications.delete({
                        where : {
                            auth_id : value.admin_id
                        }
                    })
                ]);
                if(!_.isEmpty(t)){
                    baseModel.IBaseNocontentModel = {
                        status: true,
                        status_code: httpResponse.STATUS_CREATED.status_code,
                        message: 'Delete successfully',
                        error_message: '',
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel));
                }
                else {
                    baseModel.IBaseNocontentModel = {
                        status: false,
                        status_code: httpResponse.STATUS_400.status_code,
                        message: 'Delete failed',
                        error_message: httpResponse.STATUS_400.message,
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel));
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
            console.log(e);
            Boom.badImplementation();
        }
    }
}

//FIXME: Master data 
const createMasterLocation = {
    handler : async (request , reply) => {
        try{
            const payload = request.payload
            const {value , error} = validateMasterData.createLocation.validate(payload)
            if(!error){
                let math = Math.random() * 10000000
                let newmath = Math.ceil(math)
                let _id = "LOCATION" + String(newmath)
                const body = {
                    location_id: _id,
                    location_province: value.location_province,
                    location_district: value.location_district,
                    location_zipcode: value.location_zipcode,
                    location_address: value.location_address
                }
                const createResponse = await prismaClient.tb_master_locations.create({
                    data : body
                });
                if(!_.isEmpty(createResponse)){
                    baseModel.IBaseNocontentModel = {
                        status: true,
                        status_code: httpResponse.STATUS_CREATED.status_code,
                        message: 'Create successfully',
                        error_message: '',
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel));
                }
                else {
                    baseModel.IBaseNocontentModel = {
                        status: false,
                        status_code: httpResponse.STATUS_400.status_code,
                        message: 'Create failed',
                        error_message: httpResponse.STATUS_400.message,
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel));
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
        catch(e){
            console.log(e);
            Boom.badImplementation();
        }
    }
}
module.exports = {
    //Admin
    createAdmin,
    getAllAdmin,
    updateAdmin,
    deleteAdmin,

    //MasterData 
    createMasterLocation
}