const authenticationHandler = require('../authentication/authentication.js')

const routers = [
    {
        method : 'POST',
        path : '/api/singin',
        config : authenticationHandler.signIn
    },
    {
        method : 'POST',
        path : '/api/signout',
        config : authenticationHandler.signOut
    },
    {
        method : 'POST',
        path : '/api/refresh',
        config : authenticationHandler.refreshToken
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