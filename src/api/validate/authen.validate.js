const Joi = require('joi')

const signInValidate = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
});


const registerValidate = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required(),
});



module.exports = {
    signInValidate,
    registerValidate
}