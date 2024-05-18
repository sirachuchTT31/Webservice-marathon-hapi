const baseModel = require('../utils/response-model.js');
const httpResponse = require('./http-response.js');
const InternalServerError = (message) => {
    try{
        return baseModel.IBaseNocontentModel = {
            status: false,
            status_code: httpResponse.STATUS_500.status_code,
            message: message ? message : httpResponse.STATUS_500.message,
            error_message : httpResponse.STATUS_500.message
        }
    }
    catch(e){
        console.log(e)
    }
}

const BadRequestError = (message) => {
    try{
        return baseModel.IBaseNocontentModel = {
            status : false , 
            status_code : httpResponse.STATUS_400.status_code,
            message : message ? message : httpResponse.STATUS_400.message,
            error_message : httpResponse.STATUS_400.status_code
        }
    }
    catch(e){
        console.log(e)
    }
}

module.exports = {
    InternalServerError,
    BadRequestError
}