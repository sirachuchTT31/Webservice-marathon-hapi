const Joi = require('joi')

const createMasterLocation = Joi.object().keys({
    province: Joi.string().required(),
    district: Joi.string().required(),
    zipcode: Joi.string().required(),
    address: Joi.string().required()
});

module.exports = {
    createMasterLocation
}