const Controller = require('../controllers/api.controlles.js')

const routers = [
    //FIXME: Admin
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
    },
    //FIXME: MasterData
    {
        method : 'POST',
        path : '/api/create-master-location',
        config : Controller.createMasterLocation
    },
    {
        method : 'GET',
        path : '/api/get-all-master-location',
        config : Controller.getAllLocation
    },
    {
        method : 'POST',
        path : '/api/create-event',
        config : Controller.createEvent
    }
]

module.exports = routers