const Joi = require('joi');

const createRegisterEvent = Joi.object().keys({
    description : Joi.string().required(),
    event_id : Joi.number().required(),
    // auth_id : Joi.string().required()
})

module.exports = {
    createRegisterEvent
}