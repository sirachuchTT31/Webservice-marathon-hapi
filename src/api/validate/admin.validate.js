const Joi = require('joi')

const createAdminValidate = Joi.object().keys({
    admin_username: Joi.string().required(),
    admin_password: Joi.string().required(),
    admin_name: Joi.string().required(),
    admin_lastname: Joi.string().required(),
    admin_email: Joi.string().required(),
    admin_tel : Joi.string(),
    admin_address : Joi.string(),
    admin_email : Joi.string(),
    admin_avatar : Joi.string().empty(''),
    
})

module.exports = {
    createAdminValidate
}