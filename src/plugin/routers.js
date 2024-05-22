const authenRouter = require('../api/routers/authen.router.js');
const routerAPI = require('../api/routers/api.router.js')
module.exports = {
    plugin: {
        prefix : '/api',
        name: 'router',
        version: '1.0.0',
        register: (server) => {
            authenRouter?.forEach((path) => server.route(path))
            routerAPI?.forEach((path) => server.route(path))
        }
    }
}