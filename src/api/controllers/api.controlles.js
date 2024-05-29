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
const validateBackoffice = require('../validate/backoffice.validate.js')
const validateEventMember = require('../validate/event-member.validate.js')
const JWT = require('../../utils/authentication.js')
const Handler = require('../handler/api.handler.js');
const cryptLib = require('../../utils/crypt-lib.js')
const Response = require('../../constant/response.js')

//FIXME: Master data
const getAllMasterLocation = {
    handler: async (request, reply) => {
        try {
            const findAll = await prismaClient.masterLocation.findMany({
                where: {
                    is_active: true
                },
                orderBy: {
                    province: 'asc'
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
                    status_code: httpResponse.STATUS_201_NOCONENT.status_code,
                    message: httpResponse.STATUS_201_NOCONENT.message,
                    results: []
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

//FIXME: Flow 
const createRegisterEvent = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload;
            const token = request.headers.authorization;
            const { value, error } = validateEventMember.createRegisterEvent.validate(payload);
            if (!error) {
                const jwtDecode = await JWT.jwtDecode(token);
                let idDecode = await cryptLib.decryptAES(jwtDecode.id);
                const t = await prismaClient.$transaction(async (tx) => {
                    const findDuplicate = await tx.eventJoin.findFirst({
                        where: {
                            AND: [
                                {
                                    created_by: Number(idDecode)
                                },
                                {
                                    event_id: value.event_id
                                }
                            ]
                        }
                    });
                    if (_.isEmpty(findDuplicate)) {
                        const createEventJoin = await tx.eventJoin.create({
                            data: {
                                description: value.description,
                                event_id: value.event_id,
                                created_by: Number(idDecode),
                                Transaction: {
                                    create: {
                                        status: '11',
                                        created_by: Number(idDecode),
                                        type: 'JoinEvent',
                                    }
                                },
                            },
                            select: {
                                id: true,
                                event_id: true
                            },
                        })
                        const createUserOnEventJoin = await tx.userOnEventJoin.create({
                            data: {
                                user_id: Number(idDecode),
                                created_by: Number(idDecode),
                                event_join_id: createEventJoin.id,
                                status_code: '11'
                            }
                        });
                        const createRecordDataEvent = await tx.recordDataEvent.create({
                            data: {
                                is_end: false,
                                event_join_id: createEventJoin.id,
                                event_id: createEventJoin.event_id,
                            }
                        });
                        //Finish job is stamp finish_time && sequence

                        return createEventJoin.id ? true : false
                    }
                    return false
                });
                if (t === true) {
                    baseModel.IBaseSingleResultModel = {
                        status: true,
                        status_code: httpResponse.STATUS_CREATED.status_code,
                        message: 'ลงทะเบียนสำเร็จ',
                        error_message: '',
                        result: t
                    }
                    return reply.response(await baseResult.IBaseSingleResult(baseModel.IBaseSingleResultModel))
                }
                else {
                    baseModel.IBaseSingleResultModel = {
                        status: false,
                        status_code: httpResponse.STATUS_CREATED.status_code,
                        message: 'ลงทะเบียนไม่สำเร็จ',
                        error_message: '',
                        result: t
                    }
                    return reply.response(await baseResult.IBaseSingleResult(baseModel.IBaseSingleResultModel))
                }


            }
            else {
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const getAllHistory = {
    handler: async (request, reply) => {
        try {
            const token = request.headers.authorization.replace("Bearer ", "")
            const jwtDecode = await JWT.jwtDecode(token)
            let idDecode = await cryptLib.decryptAES(jwtDecode.id)
            const params = request.query
            //Logic pagination 
            let skipData = Number(params.page) * Number(params.per_page);
            let takeData = params.per_page;
            let results = {}
            const t = await prismaClient.$transaction(async (tx) => {
                const findPagination = await tx.userOnEventJoin.findMany(
                    {
                        where: {
                            user_id: Number(idDecode)
                        },
                        include: {
                            EventJoin: {
                                select: {
                                    id: true,
                                    description: true,
                                    Event: {
                                        select: {
                                            id: true,
                                            name: true,
                                            path_image: true,
                                        }
                                    }
                                }
                            }
                        },
                        skip: Number(skipData),
                        take: Number(takeData),
                        orderBy: {
                            created_at: 'desc'
                        }
                    }
                )
                const countAll = await tx.userOnEventJoin.count({
                    where: {
                        user_id: Number(idDecode)
                    },
                });
                console.log(findPagination)
                results = {
                    data: findPagination,
                    totalRecord: countAll,
                }
                return !_.isEmpty(findPagination) ? results : null;
            })
            if (!_.isEmpty(t)) {
                baseModel.IBaseCollectionResultsPaginationModel = {
                    status: true,
                    status_code: httpResponse.STATUS_200.status_code,
                    message: httpResponse.STATUS_200.message,
                    results: results.data,
                    total_record: results.totalRecord,
                    page: params.page,
                    per_page: params.per_page
                }
                return reply.response(await baseResult.IBaseCollectionResultsPagination(baseModel.IBaseCollectionResultsPaginationModel))
            }
            else {
                baseModel.IBaseCollectionResultsPaginationModel = {
                    status: true,
                    status_code: httpResponse.STATUS_201_NOCONENT.status_code,
                    message: httpResponse.STATUS_201_NOCONENT.message,
                    results: null,
                    total_record: 0,
                    page: 0,
                    per_page: 0
                }
                return reply.response(await baseResult.IBaseCollectionResultsPagination(baseModel.IBaseCollectionResultsPaginationModel))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const createEvent = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const token = request.headers.authorization
            const { value, error } = validateEvent.createEventValidate.validate(payload);
            if (!error) {
                const jwtPayload = await JWT.jwtDecode(token)
                const createdId = await cryptLib.decryptAES(jwtPayload.id)
                const userId = await cryptLib.decryptAES(value.auth_id)
                const t = await prismaClient.$transaction(async (tx) => {
                    const response = await tx.event.create({
                        data: {
                            name: value.name,
                            price: Number(parseFloat(value.price).toFixed(2)),
                            max_amount: Number(value.max_amount),
                            detail: value.detail,
                            distance: value.distance,
                            due_date: new Date(value.due_date),
                            path_image: '',
                            status_code: '01',
                            location_id: Number(value.location_id),
                            created_by: Number(createdId),
                            user_id: Number(createdId),
                            Transaction: {
                                create: {
                                    status: '01',
                                    type: 'Event',
                                    created_by: Number(createdId)
                                }
                            }
                        },
                        select: {
                            id: true
                        }
                    })
                    return response.id ? response.id : null
                })
                if (t) {
                    baseModel.IBaseSingleResultModel = {
                        status: true,
                        status_code: httpResponse.STATUS_CREATED.status_code,
                        message: httpResponse.STATUS_CREATED.message,
                        error_message: '',
                        result: t
                    }
                    return reply.response(await baseResult.IBaseSingleResult(baseModel.IBaseSingleResultModel))
                }
                else {
                    baseModel.IBaseSingleResultModel = {
                        status: false,
                        status_code: httpResponse.STATUS_CREATED.status_code,
                        message: httpResponse.STATUS_500.message,
                        error_message: '',
                        result: ''
                    }
                    return reply.response(await baseResult.IBaseSingleResult(baseModel.IBaseSingleResultModel))
                }
            }
            else {
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

//FIXME: Organizer approved
const getAllEventRegister = {
    handler: async (request, reply) => {
        try {
            const token = request.headers.authorization.replace("Bearer ", "")
            const jwtDecode = await JWT.jwtDecode(token);
            let idDecode = await cryptLib.decryptAES(jwtDecode.id);
            const params = request.query;
            //Logic pagination 
            let skipData = Number(params.page) * Number(params.per_page);
            let takeData = params.per_page;
            let results = {}
            const t = await prismaClient.$transaction(async (tx) => {
                const findPagination = await prismaClient.eventJoin.findMany({
                    where: {
                        AND: [
                            {
                                event_id: params.event_id
                            },
                            {
                                Event: {
                                    created_by: Number(idDecode)
                                }
                            }
                        ]
                    },
                    skip: skipData,
                    take: takeData,
                    orderBy: {
                        created_by: 'desc'
                    }
                });
                const countAll = await prismaClient.eventJoin.count({
                    where: {
                        AND: [
                            {
                                event_id: params.event_id
                            },
                            {
                                Event: {
                                    created_by: Number(idDecode)
                                }
                            }
                        ]
                    },
                });
                results = {
                    data: findPagination,
                    totalRecord: countAll,
                }
                return !_.isEmpty(findPagination) ? results : null;
            })
            if (!_.isEmpty(t)) {
                baseModel.IBaseCollectionResultsPaginationModel = {
                    status: true,
                    status_code: httpResponse.STATUS_200.status_code,
                    message: httpResponse.STATUS_200.message,
                    results: results.data,
                    total_record: results.totalRecord,
                    page: params.page,
                    per_page: params.per_page
                }
                return reply.response(await baseResult.IBaseCollectionResultsPagination(baseModel.IBaseCollectionResultsPaginationModel))
            }
            else {
                baseModel.IBaseCollectionResultsPaginationModel = {
                    status: true,
                    status_code: httpResponse.STATUS_201_NOCONENT.status_code,
                    message: httpResponse.STATUS_201_NOCONENT.message,
                    results: null,
                    total_record: 0,
                    page: 0,
                    per_page: 0
                }
                return reply.response(await baseResult.IBaseCollectionResultsPagination(baseModel.IBaseCollectionResultsPaginationModel))
            }
        }
        catch (e) {

        }
    }
}

const updateApprovedEventRegister = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload;
            const token = request.headers.authorization
            const { value, error } = validateEvent.updateApprovedEventRegister.validate(payload);
            if (!error) {

            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const uploadImageEvent = {
    payload: {
        output: 'stream',
        parse: true,
        multipart: true
    },
    handler: async (request, reply) => {
        try {
            const payload = request.payload;
            const id = await cryptLib.decryptAES(payload.id)
            const t = await prismaClient.$transaction(async (tx) => {
                const pathImage = await Handler.HandleruploadImageEvent(payload)
                if (!pathImage) {
                    return null
                }
                const updateEvent = await tx.event.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        path_image: pathImage
                    }
                });
                return updateEvent ? updateEvent : ''
            });
            if (!_.isEmpty(t)) {
                baseModel.IBaseNocontentModel = {
                    status: true,
                    status_code: httpResponse.STATUS_200.status_code,
                    error_message: '',
                    message: 'Create successfully'
                }
                return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
            }
            else {
                baseModel.IBaseNocontentModel = {
                    status: true,
                    status_code: httpResponse.STATUS_500.status_code,
                    error_message: '',
                    message: httpResponse.STATUS_500.message
                }
                return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
            }
        }
        catch (e) {
            console.log(e)
            return reply.response(Response.InternalServerError(e.message))
        }
    },
}

const getAllEvent = {
    handler: async (request, reply) => {
        try {
            const t = await prismaClient.$transaction(async (tx) => {
                let currentDate = new Date()
                const findAll = await tx.event.findMany({
                    where: {
                        AND: [
                            {
                                status_code: '02'
                            },
                            {
                                due_date: {
                                    gte: currentDate
                                }
                            }
                        ]
                    }, include: {
                        MasterLocation: {
                            select: {
                                id: true,
                                province: true,
                                address: true,
                                zipcode: true,
                                district: true
                            }
                        }
                    }
                });

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
                    status: true,
                    status_code: httpResponse.STATUS_201_NOCONENT.status_code,
                    message: httpResponse.STATUS_201_NOCONENT.message,
                    results: []
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

// *********************************************** Back-ofiice **********************************************
//FIXME: Master data 
const getAllMasterLocationBackoffice = {
    handler: async (request, reply) => {
        try {
            const findAll = await prismaClient.masterLocation.findMany({
                orderBy: {
                    province: 'asc'
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
                    status_code: httpResponse.STATUS_201_NOCONENT.status_code,
                    message: httpResponse.STATUS_201_NOCONENT.message,
                    results: []
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const createMasterLocationBackoffice = {
    handler: async (request, reply) => {
        try {
            const token = request.headers.authorization.replace("Bearer ", "")
            const jwtDecode = await JWT.jwtDecode(token)
            const payload = request.payload
            const { value, error } = validateMasterData.createMasterLocation.validate(payload)
            let idDecode = await cryptLib.decryptAES(jwtDecode.id)
            if (!error) {
                const response = await prismaClient.masterLocation.create({
                    data: {
                        province: value.province,
                        address: value.address,
                        district: value.district,
                        zipcode: value.zipcode,
                        created_by: Number(idDecode)
                    }
                });
                if (!_.isEmpty(response)) {
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
                        status_code: httpResponse.STATUS_CREATED.status_code,
                        message: 'Create failed',
                        error_message: httpResponse.STATUS_CREATED.message,
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel));
                }
            }
            else {
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const updateMasterLocationBackoffice = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload;
            const { value, error } = validateBackoffice.updateMasterLocationValidate(payload)
            if (!error) {
                const token = request.headers.authorization.replace("Bearer ", "")
                const jwtDecode = await JWT.jwtDecode(token)
                let idDecode = await cryptLib.decryptAES(jwtDecode.id)
                const response = await prismaClient.masterLocation.update({
                    where: {
                        id: value.id
                    },
                    data: {
                        province: value.province,
                        district: value.district,
                        zipcode: value.zipcode,
                        address: value.address,
                        updated_by: Number(idDecode)
                    }
                });
                if (!_.isEmpty(response)) {
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
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.error(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const deleteMasterLocationBackoffice = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateBackoffice.deleteMasterLocationValidate.validate(payload)
            if (!error) {
                const response = await prismaClient.masterLocation.delete({
                    where: {
                        id: value.id
                    }
                })
                if (!_.isEmpty(response)) {
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
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

//FIXME: Admin
const getAllAdminBackoffice = {
    tags: ['api'],
    description: 'Get All Admin',
    handler: async (request, reply) => {
        try {
            const findAll = await prismaClient.user.findMany({
                where: {
                    role: 'admin'
                },
                orderBy: {
                    created_at: 'desc'
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
                    status: false,
                    status_code: httpResponse.STATUS_500.message,
                    message: httpResponse.STATUS_500.message,
                    results: []
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
        }
        catch (e) {
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const createAdminBackoffice = {
    tags: ['api'],
    description: 'Create Admin',
    validate: {
        payload: validateAdmin.createAdminValidate
    },
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateAdmin.createAdminValidate.validate(payload)
            if (!error) {
                const token = request.headers.authorization.replace("Bearer ", "")
                const jwtDecode = await JWT.jwtDecode(token)
                const findDuplicates = await prismaClient.user.findFirst({
                    where: {
                        username: value.username,
                        role: 'admin'
                    }
                })
                let idDecode = await cryptLib.decryptAES(jwtDecode.id)
                if (_.isEmpty(findDuplicates)) {
                    let salt = await bcrypt.genSalt(10);
                    let hash = await bcrypt.hash(value.password, salt)
                    const response = await prismaClient.user.create({
                        data: {
                            username: value.username,
                            password: hash,
                            name: value.name,
                            lastname: value.lastname,
                            address: value.address,
                            telephone: value.telephone,
                            email: value.email,
                            avatar: 'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Round&hairColor=BrownDark&facialHairType=BeardMedium&facialHairColor=BrownDark&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
                            access_status: 'Y',
                            role: 'admin',
                            created_by: Number(idDecode)
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
            console.log(e)
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const updateAdminBackoffice = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateAdmin.updateAdminValidate.validate(payload)
            if (!error) {
                const token = request.headers.authorization.replace("Bearer ", "")
                const jwtDecode = await JWT.jwtDecode(token)
                let idDecode = await cryptLib.decryptAES(jwtDecode.id)
                const response = await prismaClient.user.update({
                    where: {
                        id: value.id,
                        role: 'admin'
                    },
                    data: {
                        name: value.name,
                        lastname: value.lastname,
                        email: value.email,
                        address: value.address,
                        telephone: value.telephone,
                        updated_by: Number(idDecode)
                    }
                })
                if (!_.isEmpty(response)) {
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
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.error(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const deleteAdminBackoffice = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateAdmin.deleteAdminValidate.validate(payload)
            if (!error) {
                const response = await prismaClient.user.delete({
                    where: {
                        id: value.id
                    }
                })
                if (!_.isEmpty(response)) {
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
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

//FIXME: Organizer
const getAllOrganizerBackoffice = {
    handler: async (reqeust, reply) => {
        try {
            const findAll = prismaClient.user.findMany({
                where: {
                    role: 'organizer'
                },
                orderBy: {
                    created_at: 'desc'
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
            console.log(e)
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const createOrganizerBackoffice = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload;
            const token = request.headers.authorization;
            const { value, error } = validateBackoffice.createOrganizerValidate(payload);
            if (!error) {
                const token = request.headers.authorization.replace("Bearer ", "")
                const jwtDecode = await JWT.jwtDecode(token)
                const findDuplicates = await prismaClient.user.findFirst({
                    where: {
                        username: value.username,
                        role: 'organizer'
                    }
                })
                let idDecode = await cryptLib.decryptAES(jwtDecode.id);
                if (_.isEmpty(findDuplicates)) {
                    let salt = await bcrypt.genSalt(10);
                    let hash = await bcrypt.hash(value.password, salt)
                    const response = await prismaClient.user.create({
                        data: {
                            username: value.username,
                            password: hash,
                            name: value.name,
                            lastname: value.lastname,
                            address: value.address,
                            telephone: value.telephone,
                            email: value.email,
                            avatar: 'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Round&hairColor=BrownDark&facialHairType=BeardMedium&facialHairColor=BrownDark&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
                            access_status: 'Y',
                            role: 'organizer',
                            created_by: Number(idDecode)
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
            console.log(e)
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const updateOrganizerBackoffice = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateBackoffice.updateOrganizerValidate.validate(payload)
            if (!error) {
                const token = request.headers.authorization.replace("Bearer ", "")
                const jwtDecode = await JWT.jwtDecode(token)
                let idDecode = await cryptLib.decryptAES(jwtDecode.id)
                const response = await prismaClient.user.update({
                    where: {
                        id: value.id,
                        role: 'organizer'
                    },
                    data: {
                        name: value.name,
                        lastname: value.lastname,
                        email: value.email,
                        address: value.address,
                        telephone: value.telephone,
                        updated_by: Number(idDecode)
                    }
                })
                if (!_.isEmpty(response)) {
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
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.error(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const deleteOrganizerBackoffice = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateBackoffice.deleteOrganizerValidate(payload)
            if (!error) {
                const response = await prismaClient.user.delete({
                    where: {
                        id: value.id
                    }
                })
                if (!_.isEmpty(response)) {
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
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}
//FIXME: Member
const getAllMemberBackoffice = {
    handler: async (reqeust, reply) => {
        try {
            const findAll = prismaClient.user.findMany({
                where: {
                    role: 'member'
                },
                orderBy: {
                    created_at: 'desc'
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
            console.log(e)
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const createMemberBackoffice = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload;
            const token = request.headers.authorization;
            const { value, error } = validateBackoffice.createMemberValidate(payload);
            if (!error) {
                const token = request.headers.authorization.replace("Bearer ", "")
                const jwtDecode = await JWT.jwtDecode(token)
                const findDuplicates = await prismaClient.user.findFirst({
                    where: {
                        username: value.username,
                        role: 'member'
                    }
                })
                let idDecode = await cryptLib.decryptAES(jwtDecode.id);
                if (_.isEmpty(findDuplicates)) {
                    let salt = await bcrypt.genSalt(10);
                    let hash = await bcrypt.hash(value.password, salt)
                    const response = await prismaClient.user.create({
                        data: {
                            username: value.username,
                            password: hash,
                            name: value.name,
                            lastname: value.lastname,
                            address: value.address,
                            telephone: value.telephone,
                            email: value.email,
                            avatar: 'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Round&hairColor=BrownDark&facialHairType=BeardMedium&facialHairColor=BrownDark&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
                            access_status: 'Y',
                            role: 'member',
                            created_by: Number(idDecode)
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
            console.log(e)
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const updateMemberBackoffice = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateBackoffice.updateMemberValidate.validate(payload)
            if (!error) {
                const token = request.headers.authorization.replace("Bearer ", "")
                const jwtDecode = await JWT.jwtDecode(token)
                let idDecode = await cryptLib.decryptAES(jwtDecode.id)
                const response = await prismaClient.user.update({
                    where: {
                        id: value.id,
                        role: 'member'
                    },
                    data: {
                        name: value.name,
                        lastname: value.lastname,
                        email: value.email,
                        address: value.address,
                        telephone: value.telephone,
                        updated_by: Number(idDecode)
                    }
                })
                if (!_.isEmpty(response)) {
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
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.error(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const deleteMemberBackoffice = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateBackoffice.deleteMemberValidate(payload)
            if (!error) {
                const response = await prismaClient.user.delete({
                    where: {
                        id: value.id
                    }
                })
                if (!_.isEmpty(response)) {
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
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

//FIXME: Event
const createEventBackoffice = {
    handler: async (request, reply) => {
        try {

        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const getEventBackoffice = {
    handler: async (request, reply) => {
        try {
            const getEvent = await prismaClient.event.findMany(
                {
                    where: {
                        status_code: '01'
                    },
                    include: {
                        MasterLocation: {
                            select: {
                                id: true,
                                province: true,
                                address: true,
                                zipcode: true,
                                district: true
                            }
                        }
                    }
                }
            );
            if (!_.isEmpty(getEvent)) {
                baseModel.IBaseCollectionResultsModel = {
                    status: true,
                    status_code: httpResponse.STATUS_200.status_code,
                    message: httpResponse.STATUS_200.message,
                    results: getEvent
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
            else {
                baseModel.IBaseCollectionResultsModel = {
                    status: false,
                    status_code: httpResponse.STATUS_200.status_code,
                    message: httpResponse.STATUS_200.message,
                    results: []
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const updateEventBackoffice = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const token = request.headers.authorization
            const { value, error } = validateEvent.updateEventValidate.validate(payload);
            if (!error) {
                const jwtDecode = await JWT.jwtDecode(token)
                let idDecode = await cryptLib.decryptAES(jwtDecode.id)
                const t = await prismaClient.$transaction(async (tx) => {
                    await tx.event.update({
                        where: {
                            id: Number(value.event_id)
                        },
                        data: {
                            status_code: value.status,
                            updated_by: Number(idDecode),
                        }
                    })
                    const createTransaction = await tx.transaction.create({
                        data: {
                            status: value.status,
                            type: 'Event_Approved',
                            created_by: Number(idDecode),
                            event_id: Number(value.event_id)
                        },
                        select: {
                            id: true
                        }
                    })
                    return createTransaction.id ? true : false
                });
                if (t === true) {
                    baseModel.IBaseNocontentModel = {
                        status: true,
                        message: 'Update success',
                        status_code: httpResponse.STATUS_200.status_code,
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
                }

                baseModel.IBaseNocontentModel = {
                    status: false,
                    status_code: httpResponse.STATUS_200.status_code,
                    message: 'Updated failed'
                }
                return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
            }
            else {
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch (e) {
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const cryptTest = {
    auth: false,
    handler: async (request, reply) => {
        try {
            const payload = request.payload.id
            const cipher = await cryptLib.encryptAES(payload)
            const orginal = await cryptLib.decryptAES(cipher)
            return {
                encrypt: cipher,
                decrypt: orginal
            }
        }
        catch (e) {
            console.log(e)
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

//******************************************************* empty ************************** */
const emptyPath = {
    auth: false,
    handler: async (request, h) => {
        return "<h1>Welcome to API Vesion 1.0.0</h1>"
    }
}


module.exports = {
    //Admin

    //MasterData 
    getAllMasterLocation,

    //Event 
    createEvent,
    getAllEvent,
    uploadImageEvent,
    getAllEventRegister,

    //Test
    cryptTest,

    //Back-office 
    getAllMasterLocationBackoffice,
    createMasterLocationBackoffice,
    updateMasterLocationBackoffice,
    deleteMasterLocationBackoffice,
    getEventBackoffice,
    updateEventBackoffice,
    getAllOrganizerBackoffice,
    createOrganizerBackoffice,
    updateOrganizerBackoffice,
    deleteOrganizerBackoffice,
    getAllMemberBackoffice,
    createMemberBackoffice,
    updateMemberBackoffice,
    deleteMemberBackoffice,
    getAllAdminBackoffice,
    createAdminBackoffice,
    updateAdminBackoffice,
    deleteAdminBackoffice,
    createRegisterEvent,
    getAllHistory,



    //*************** emtyp ************** */
    emptyPath
}