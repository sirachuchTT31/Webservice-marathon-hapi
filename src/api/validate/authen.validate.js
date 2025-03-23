const Joi = require('joi')

const signInValidate = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
});

const signOutValidate = Joi.object().keys({
    authen_log_id: Joi.number().required()
})

const registerValidate = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required(),
    registration_number: Joi.string(),
    contact: Joi.string()
});



module.exports = {
    signInValidate,
    signOutValidate,
    registerValidate
}