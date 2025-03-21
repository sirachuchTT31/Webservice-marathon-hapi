const Joi = require('joi')
const createPayment = Joi.object().keys({
    total_price: Joi.number().required(),
    type_payment: Joi.string().required(),
    invoice_id: Joi.number().required(),
    event_id: Joi.number().required(),
    event_join_id: Joi.number().required(),
    user_id: Joi.any().required()
});

module.exports = {
    createPayment
}