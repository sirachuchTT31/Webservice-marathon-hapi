const Controller = require('../controllers/api.controlles.js')

const routers = [
    {
        method : 'POST',
        path : '/api/create-admin',
        config : Controller.createAdmin
    },
    {
        method : 'GET',
        path : '/api/get-all-admin',
        config : Controller.getAllAdmin
    }
]

module.exports = routers