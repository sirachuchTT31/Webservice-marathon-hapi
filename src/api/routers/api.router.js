const Controller = require('../controllers/api.controlles.js')

const routers = [
    {
        method : 'GET',
        path : '/api/get-all-admin',
        config : Controller.getAllAdmin
    }
]

module.exports = routers