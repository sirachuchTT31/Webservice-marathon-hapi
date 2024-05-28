const Joi = require('joi')

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


module.exports = {
    createOrganizerValidate,
    updateOrganizerValidate,
    deleteOrganizerValidate,
    createMemberValidate,
    updateMemberValidate,
    deleteMemberValidate
}