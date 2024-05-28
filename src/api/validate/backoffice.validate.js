const Joi = require('joi')

const createOrganizerValidate = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required(),
    telephone: Joi.string().required(),
    address: Joi.string().required(),
})


module.exports = {
    createOrganizerValidate
}