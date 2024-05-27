const Joi = require('joi')

const createAdminValidate = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required(),
    telephone: Joi.string().required(),
    address: Joi.string().required(),
});

const updateAdminValidate = Joi.object().keys({
    id: Joi.number().required(),
    name: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required(),
    telephone: Joi.string().required(),
    address: Joi.string().required(),
});

const deleteAdminValidate = Joi.object().keys({
    id: Joi.number().required()
})
module.exports = {
    createAdminValidate,
    updateAdminValidate,
    deleteAdminValidate
}