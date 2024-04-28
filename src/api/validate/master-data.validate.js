const Joi = require('joi')

const createLocation = Joi.object().keys({
    location_province: Joi.string().required(),
    location_district: Joi.string().required(),
    location_zipcode: Joi.string().required(),
    location_address: Joi.string().required()
});

module.exports = {
    createLocation
}