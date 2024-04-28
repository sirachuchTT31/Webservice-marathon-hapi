const authenticationHandler = require('../authentication/authentication.js')

const routers = [
    {
        method : 'POST',
        path : '/api/singin',
        config : authenticationHandler.signIn
    },
    {
        method : 'POST',
        path : '/api/register-members',
        config : authenticationHandler.registerMembers
    },
    {
        method : 'POST',
        path : '/api/register-organizer',
        config : authenticationHandler.registerOrganizer
    }
]

module.exports = routers