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
    },
    {
        method : 'POST',
        path : '/api/update-admin',
        config : Controller.updateAdmin
    },
    {
        method : 'POST',
        path : '/api/delete-admin',
        config : Controller.deleteAdmin
    }
]

module.exports = routers