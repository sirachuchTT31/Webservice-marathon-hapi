const authenticationHandler = require('../authentication/authentication.js')

const routers = [
    {
        method : 'POST',
        path : '/api/singin',
        config : authenticationHandler.signIn
    }
]

module.exports = routers