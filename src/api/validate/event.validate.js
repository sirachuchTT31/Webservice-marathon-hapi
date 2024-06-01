const Joi = require('joi')

const createEventValidate = Joi.object().keys({
    name: Joi.string().required(),
    due_date: Joi.string().required(),
    price: Joi.any().required(),
    max_amount: Joi.any().required(),
    detail: Joi.string().required(),
    distance: Joi.string().required(),
    path_image: Joi.string().allow(null).allow(''),
    location_id: Joi.string().required(),
    auth_id: Joi.string().required()
})

const updateEventValidate = Joi.array().items(Joi.object().keys({
        id: Joi.number().required(),
        status_code: Joi.string().required(),
        is_active: Joi.boolean().required()
}))
// const updateEventValidate = Joi.object().keys({

// })


const updateApprovedEventRegister = Joi.object().keys({
    event_join_id: Joi.number().required(),
    status: Joi.string().required()
});


module.exports = {
    createEventValidate,
    updateEventValidate,
    updateApprovedEventRegister
}