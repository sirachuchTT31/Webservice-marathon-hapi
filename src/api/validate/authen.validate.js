const Joi = require('joi')

const signInValidate = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
})

module.exports = {
    signInValidate
}