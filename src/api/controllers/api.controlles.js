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
const Handler = require('../handler/api.handler.js');
const cryptLib = require('../../utils/crypt-lib.js')
const Response = require('../../constant/response.js')

//FIXME: Admin
const createAdmin = {
    tags : ['api'],
    description : 'Create Admin',
    validate : {
        payload : validateAdmin.createAdminValidate
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
                if (_.isEmpty(findDuplicates)) {
                    let salt = await bcrypt.genSalt(10);
                    let hash = await bcrypt.hash(value.password, salt)
                    const response = await prismaClient.user.create({
                        data: {
                            username: value.username,
                            password: hash,
                            name: value.name,
                            lastname: value.lastname,
                            email: value.email,
                            avatar: 'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Round&hairColor=BrownDark&facialHairType=BeardMedium&facialHairColor=BrownDark&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
                            access_status: 'Y',
                            role: 'admin',
                            created_by: jwtDecode.id
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

const getAllAdmin = {
    tags : ['api'],
    description : 'Get All Admin',
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

const updateAdmin = {
    handler: async (request, reply) => {
        try {
            const payload = request.payload
            const { value, error } = validateAdmin.updateAdminValidate.validate(payload)
            if (!error) {
                const token = request.headers.authorization.replace("Bearer ", "")
                const jwtDecode = await JWT.jwtDecode(token)
                const response = await prismaClient.user.update({
                    where: {
                        id: value.id,
                        role: 'admin'
                    },
                    data: {
                        name: value.name,
                        lastname: value.lastname,
                        email: value.email,
                        updated_by: jwtDecode.id
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

const deleteAdmin = {
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

//FIXME: Master data 
// TODO: Dont test
const createMasterLocation = {
    handler: async (request, reply) => {
        try {
            const token = request.headers.authorization.replace("Bearer ", "")
            const jwtDecode = await JWT.jwtDecode(token)
            const payload = request.payload
            const { value, error } = validateMasterData.createMasterLocation.validate(payload)
            if (!error) {
                const response = await prismaClient.masterLocation.create({
                    data: {
                        province: value.province,
                        address: value.address,
                        district: value.district,
                        zipcode: value.zipcode,
                        created_by: jwtDecode.id
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
// TODO: Dont test
const getAllMasterLocation = {
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
                const t = await prismaClient.$transaction([
                    prismaClient.transaction.create({
                        data: {
                            status: '01',
                            user_id: Number(userId),
                            created_by: Number(createdId),
                            type: 'Event',
                            Event: {
                                create: {
                                    name: value.name,
                                    price: Number(parseFloat(value.price).toFixed(2)),
                                    max_amount: Number(value.max_amount),
                                    detail: value.detail,
                                    distance: value.distance,
                                    due_date: new Date(value.due_date),
                                    path_image: '',
                                    status_code: '01',
                                    location_id: Number(value.location_id),
                                    created_by: Number(createdId)
                                }
                            }
                        }
                    })
                ]);
                console.log('t',t)
                if (!_.isEmpty(t)) {
                    baseModel.IBaseSingleResultModel = {
                        status: true,
                        status_code: httpResponse.STATUS_CREATED.status_code,
                        message: httpResponse.STATUS_CREATED.message,
                        error_message: '',
                        result: t[0].id
                    }
                    return reply.response(await baseResult.IBaseSingleResult(baseModel.IBaseSingleResultModel))
                }
                else {
                    baseModel.IBaseSingleResultModel = {
                        status: false,
                        status_code:httpResponse.STATUS_CREATED.status_code,
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

const uploadImageEvent = {
    payload: {
        output: 'stream',
        parse: true,
        multipart: true
    },
    handler: async (request, reply) => {
        try {
            const payload = request.payload;
            console.log(payload.id)
            const id = await cryptLib.decryptAES(payload.id)
            const t = await prismaClient.$transaction(async (tx) => {
                const pathImage = await Handler.HandleruploadImageEvent(payload)
                if (!pathImage) {
                    return null
                }
                const updateEvent = await tx.event.update({
                    where: {
                        trans_id: Number(id)
                    },
                    data: {
                        path_image: pathImage
                    }
                });
                return updateEvent ? updateEvent : ''
            });
            console.log(t)
            if (!_.isEmpty(t)) {
                baseModel.IBaseNocontentModel = {
                    status: true,
                    status_code: httpResponse.STATUS_200.status_code,
                    error_message: '',
                    message: 'Updated successfully'
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
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

// *********************************************** Back-ofiice **********************************************
const getEventBackoffice = {
    handler : async (request , reply) => {
        try{
            const getEvent = await prismaClient.event.findMany(
                {
                    where : {
                        status_code : '01'
                    } ,
                    include : {
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
            if(!_.isEmpty(getEvent)){
                baseModel.IBaseCollectionResultsModel = {
                    status : true ,
                    status_code : httpResponse.STATUS_200.status_code ,
                    message : httpResponse.STATUS_200.message,
                    results : getEvent
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
            else {
                baseModel.IBaseCollectionResultsModel = {
                    status : false ,
                    status_code : httpResponse.STATUS_200.status_code ,
                    message : httpResponse.STATUS_200.message,
                    results : []
                }
                return reply.response(await baseResult.IBaseCollectionResults(baseModel.IBaseCollectionResultsModel))
            }
        }
        catch(e){
            console.log(e);
            return reply.response(Response.InternalServerError(e.message))
        }
    }
}

const updateEventBackoffice = {
    handler : async (request , reply) => {
        try{
            const payload = request.payload
            const token = request.headers.authorization
            const { value, error } = validateEvent.updateEventValidate.validate(payload);
            if(!error){
                const updateEvent = await prismaClient.transaction.update(
                    {
                        data : {
                            status : value.status,
                            Event : {
                                update : {
                                    status_code : value.status
                                }
                            }
                        },
                        where : {
                            id : Number(value.transaction_id)
                        },
                        include : {
                            Event : true
                        }
                    });
                    if(!_.isEmpty(updateEvent)){
                        baseModel.IBaseNocontentModel = {
                            status : true,
                            message : httpResponse.STATUS_201_NOCONENT.message,
                            status_code : httpResponse.STATUS_200.status_code,
                        }
                        return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
                    }
                    
                    baseModel.IBaseNocontentModel = {
                        status : false ,
                        status_code : httpResponse.STATUS_200.status_code,
                        message : 'Updated failed'
                    }
                    return reply.response(await baseResult.IBaseNocontent(baseModel.IBaseNocontentModel))
            }
            else {
                return reply.response(await baseResult.IBaseNocontent(Response.BadRequestError(error.message)))
            }
        }
        catch(e){
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
    auth : false,
    handler : async (request , h) => {
        return "<h1>Welcome to API Vesion 1.0.0</h1>"
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
    getAllMasterLocation,

    //Event 
    createEvent,
    getAllEvent,
    uploadImageEvent,

    //Test
    cryptTest,

    //Back-office 
    getEventBackoffice,
    updateEventBackoffice,


    //*************** emtyp ************** */
    emptyPath
}