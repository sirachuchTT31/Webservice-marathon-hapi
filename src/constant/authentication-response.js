const baseResult = require('../utils/response-base.js');
const baseModel = require('../utils/response-model.js');
const httpResponse = require('./http-response.js');

const unauthorized = () => {
    try {
        return baseModel.IBaseSingleResultModel = {
            status: false,
            status_code: httpResponse.STATUS_401.status_code,
            message: httpResponse.STATUS_401.message,
            result: null
        }
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = {
    unauthorized
}