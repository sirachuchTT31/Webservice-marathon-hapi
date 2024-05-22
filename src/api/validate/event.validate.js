const Joi = require('joi') 

const createEventValidate = Joi.object().keys({
    name : Joi.string().required(),
    due_date : Joi.string().required(),
    price : Joi.any().required(),
    max_amount : Joi.any().required(),
    detail : Joi.string().required(),
    distance : Joi.string().required(),
    path_image : Joi.string().allow(null).allow(''),
    location_id : Joi.string().required(),
    auth_id : Joi.string().required()
})

const updateEventValidate = Joi.object().keys({
    transaction_id : Joi.string().required(),
    status : Joi.string().required()
})


module.exports = {
    createEventValidate,
    updateEventValidate
}