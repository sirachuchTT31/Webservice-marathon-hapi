const Joi = require('joi')

const signInValidate = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
});

const registerMembers = Joi.object().keys({
    member_username : Joi.string().required() ,
    member_password : Joi.string().required() ,
    member_name : Joi.string().required(),
    member_lastname : Joi.string().required(),
    member_email : Joi.string().required(),
});

const registerOrganizer = Joi.object().keys({
    organ_username : Joi.string().required() ,
    organ_password : Joi.string().required() ,
    organ_name : Joi.string().required(),
    organ_lastname : Joi.string().required(),
    organ_email : Joi.string().required(),
});

module.exports = {
    signInValidate,
    registerMembers,
    registerOrganizer
}