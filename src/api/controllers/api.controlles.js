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
const validateEvent = require('../validate/event.validate.js')
const JWT = require('../../utils/authentication.js')
const Handler = require('../handler/api.handler.js')

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
                    const t = await prismaClient.$transaction([
                        prismaClient.tb_authentications.create({
                            data: {
                                auth_id: _id,
                                username: payload.admin_username,
                                password: hash,
                                name: payload.admin_name,
                                lastname: payload.admin_lastname,
                                avatar: payload.admin_avatar,
                                access_status: 'N',
                                role: 'ADMIN',
                                tb_admins: {
                                    create: {
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
                                        role: 'ADMIN',
                                    }
                                }
                            }
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
                    created_at: 'desc'
                }
            })
            const token = request.headers.authorization.replace("Bearer ", "")
            console.log(token)
            console.log(await JWT.jwtVerifyRefreshToken(token))
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
                    status: false,
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
                        where: {
                            admin_id: value.admin_id
                        }
                    }),
                    prismaClient.tb_authentications.delete({
                        where: {
                            auth_id: value.admin_id
                        }
                    })
                ]);
                if (!_.isEmpty(t)) {
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
// TODO: Dont test
const createMasterLocation = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateMasterData.createLocation.validate(payload)
            if (!error) {
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
                    data: body
                });
                if (!_.isEmpty(createResponse)) {
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
        catch (e) {
            console.log(e);
            Boom.badImplementation();
        }
    }
}
// TODO: Dont test
const getAllLocation = {
    handler: async (request, reply) => {
        try {
            const findAll = prismaClient.tb_master_locations.findMany({
                orderBy: {
                    location_province: 'asc'
                }
            });
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
                    status: false,
                    status_code: httpResponse.STATUS_500.message,
                    message: httpResponse.STATUS_500.message,
                    results: []
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
        }
        catch (e) {
            console.log(e);
            Boom.badImplementation();
        }
    }
}

const createEvent = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const token = request.headers.authorization
            const { value, error } = validateEvent.createEventValidates.validate(payload);
            console.log(error)
            if (!error) {
                const todo = 'Waiting_for_admin_approve_01';
                let math = Math.random() * 10000000
                let newmath = Math.ceil(math);
                let _idEvent = 'REG_EVENT' + String(newmath);
                let _idTransaction = 'TRANS' + String(newmath);
                const jwtPayload = await JWT.jwtDecode(token)
                const t = await prismaClient.$transaction([
                    prismaClient.tb_transactions.create({
                        data: {
                            trans_id: _idTransaction,
                            trans_todo: todo,
                            trans_status: '01',
                            auth_id: value.auth_id,
                            created_by: jwtPayload.id,
                            tb_register_running_events: {
                                create: {
                                    reg_event_id: _idEvent,
                                    reg_event_amount: Number(value.reg_event_amount),
                                    reg_event_detail: value.reg_event_detail,
                                    reg_event_distance: value.reg_event_distance,
                                    reg_event_due_date: new Date(value.reg_event_due_date),
                                    reg_event_name: value.reg_event_name,
                                    reg_event_path_img: value.reg_event_path_img,
                                    reg_event_price: Number(parseFloat(value.reg_event_price).toFixed(2)),
                                    reg_event_status: '01',
                                    location_id: Number(value.location_id),
                                    created_by: jwtPayload.id
                                }
                            }
                        }
                    })
                ]);
                if (!_.isEmpty(t)) {
                    baseModel.IBaseNocontentModel = {
                        status: true,
                        status_code: httpResponse.STATUS_CREATED.status_code,
                        message: httpResponse.STATUS_CREATED.message,
                        error_message: '',
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
                }
                else {
                    baseModel.IBaseNocontentModel = {
                        status: false,
                        status_code: httpResponse.STATUS_500.status_code,
                        message: httpResponse.STATUS_500.message,
                        error_message: '',
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
            console.log(e);
            Boom.badImplementation();
        }
    }
}

const uploadImageEvent = {
    handler : async (request , reply) => {
        try{
            const payload = request.payload;
            const id = payload.id
            // const pathImage = await Handler.HandleruploadImageEvent(payload)
            return {
                status : true
            }
        }
        catch(e){

        }
    },
}

const getAllEvent = {
    handler: async (request, reply) => {
        try {
            const t = await prismaClient.$transaction(async (tx) => {
                let currentDate = new Date()
                const findAll = await tx.tb_register_running_events.findMany({
                    where: {
                        AND: [
                            {
                                reg_event_status: {
                                    equals: '02'
                                },
                            },
                            {
                                reg_event_due_date: {
                                    gte: currentDate
                                }
                            }

                        ]
                    },
                    include: {
                        tb_master_locations: {
                            select: {
                                id: true,
                                location_id: true,
                                location_province: true,
                                location_address: true,
                                location_zipcode: true,
                                location_district: true
                            }
                        }
                    }
                });

                //Auto update due date status 01 Cancel 
                const findWhereDuedate = await tx.tb_register_running_events.findMany({
                    where: {
                        AND: [
                            {
                                reg_event_due_date: {
                                    lt: currentDate
                                },
                            },
                            {
                                reg_event_status: {
                                    equals: '01'
                                }
                            }
                        ]
                    },
                })
                if (!_.isEmpty(findWhereDuedate)) {
                    for (const item of findWhereDuedate) {
                        await tx.tb_register_running_events.update({
                            where: {
                                id: item.id
                            },
                            data: {
                                reg_event_status: '04',
                                tb_transactions: {
                                    update: {
                                        trans_status: '04'
                                    }
                                }
                            },
                            include : {
                                tb_transactions : true
                            }
                        });
                    }
                }

                return _.isEmpty(findAll) ? null : findAll
            })
            if (!_.isEmpty(t)) {
                baseModel.IBaseCollectionResultsModel = {
                    status: true,
                    status_code: httpResponse.STATUS_200.status_code,
                    message: httpResponse.STATUS_200.message,
                    results: t
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
            else {
                baseModel.IBaseCollectionResultsModel = {
                    status: false,
                    status_code: httpResponse.STATUS_500.message,
                    message: httpResponse.STATUS_500.message,
                    results: []
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
        }
        catch (e) {
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
    createMasterLocation,
    getAllLocation,

    //Event 
    createEvent,
    getAllEvent,
    uploadImageEvent
}