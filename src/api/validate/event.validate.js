const Joi = require('joi') 

const createEventValidates = Joi.object().keys({
    reg_event_name : Joi.string().required(),
    reg_event_due_date : Joi.date().required(),
    reg_event_price : Joi.any().required(),
    reg_event_amount : Joi.any().required(),
    reg_event_detail : Joi.string().required(),
    reg_event_distance : Joi.string().required(),
    reg_event_path_img : Joi.string().allow(null).allow(''),
    location_id : Joi.string().required(),
    auth_id : Joi.string().required()
})


module.exports = {
    createEventValidates
}