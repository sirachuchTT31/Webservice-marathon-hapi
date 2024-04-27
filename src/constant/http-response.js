const response = require('http-status-codes')
const STATUS_200 = {
    status_code: response.StatusCodes.OK
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

module.exports = {
    STATUS_200,
    STATUS_500,
    STATUS_400,
    STATUS_401
}