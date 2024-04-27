const response = require('http-status-codes')
const STATUS_200 = {
    status_code: response.StatusCodes.OK,
    message : response.ReasonPhrases.OK
}

const STATUS_500 = {
    status_code: response.StatusCodes.INTERNAL_SERVER_ERROR,
    message: response.ReasonPhrases.INTERNAL_SERVER_ERROR
}

const STATUS_400 = {
    status_code: response.StatusCodes.BAD_REQUEST,
    message: response.ReasonPhrases.BAD_REQUEST
}

const STATUS_401 = {
    status_code: response.StatusCodes.UNAUTHORIZED,
    message: response.ReasonPhrases.UNAUTHORIZED
}

const STATUS_UNAUTHORIZED = {
    status_code : response.StatusCodes.UNAUTHORIZED,
    message : response.ReasonPhrases.UNAUTHORIZED
}

const STATUS_CREATED = {
    status_code : response.StatusCodes.CREATED,
    message : response.ReasonPhrases.CREATED
}


module.exports = {
    STATUS_200,
    STATUS_500,
    STATUS_400,
    STATUS_401,
    STATUS_UNAUTHORIZED,
    STATUS_CREATED
}