const Joi = require('joi')

const updateEventValidate = Joi.object().keys({
    event_id : Joi.number().required(),
    status : Joi.string().required(),
    is_active : Joi.boolean().required()
});


const createOrganizerValidate = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required(),
    telephone: Joi.string().required(),
    address: Joi.string().required(),
});

const updateOrganizerValidate = Joi.object().keys({
    id: Joi.number().required(),
    name: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required(),
    telephone: Joi.string().required(),
    address: Joi.string().required(),
});

const deleteOrganizerValidate = Joi.object().keys({
    id: Joi.number().required()
});

const createMemberValidate = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required(),
    telephone: Joi.string().required(),
    address: Joi.string().required(),
});

const updateMemberValidate = Joi.object().keys({
    id: Joi.number().required(),
    name: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required(),
    telephone: Joi.string().required(),
    address: Joi.string().required(),
});

const deleteMemberValidate = Joi.object().keys({
    id: Joi.number().required()
});

//Master location
const createMasterLocationValidate = Joi.object().keys({
    province: Joi.string().required(),
    district: Joi.string().required(),
    zipcode: Joi.string().required(),
    address: Joi.string().required(),
    is_active : Joi.boolean().required()
});

const updateMasterLocationValidate = Joi.object().keys({
    id : Joi.number().required(),
    province: Joi.string().required(),
    district: Joi.string().required(),
    zipcode: Joi.string().required(),
    address: Joi.string().required(),
    is_active : Joi.boolean().required()
});

const deleteMasterLocationValidate = Joi.object().keys({
    id: Joi.number().required()
});

module.exports = {
    updateEventValidate,
    createOrganizerValidate,
    updateOrganizerValidate,
    deleteOrganizerValidate,
    createMemberValidate,
    updateMemberValidate,
    deleteMemberValidate,
    //Master Location 
    createMasterLocationValidate,
    updateMasterLocationValidate,
    deleteMasterLocationValidate,
}