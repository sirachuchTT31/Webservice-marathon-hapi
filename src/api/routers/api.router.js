const Controller = require('../controllers/api.controlles.js')
const routers = [
    //FIXME: MasterData
    {
        method: 'GET',
        path: '/api/get-all-master-location',
        config: Controller.getAllMasterLocation
    },
    //FIXME: Event
    {
        method: 'POST',
        path: '/api/create-event',
        config: Controller.createEvent
    },
    {
        method: 'POST',
        path: '/api/upload-image-event',
        config: Controller.uploadImageEvent
        // options: {
        //     payload: {
        //         output: 'stream',
        //         parse: true,
        //         multipart: true
        //     }
        // },
        // ...Controller.uploadImageEvent
    },
    {
        method: 'GET',
        path: '/api/get-all-event',
        config: Controller.getAllEvent
    },
    //************************Back-office************************** */
    {
        method: 'GET',
        path: '/api/get-event-backoffice',
        config: Controller.getEventBackoffice
    },
    {
        method: 'POST',
        path: '/api/update-event-backoffice',
        config: Controller.updateEventBackoffice
    },
    //FIXME: Admin
    {
        method: 'POST',
        path: '/api/create-admin-backoffice',
        config: Controller.createAdminBackoffice,
    },
    {
        method: 'GET',
        path: '/api/get-all-admin-backoffice',
        config: Controller.getAllAdminBackoffice
    },
    {
        method: 'POST',
        path: '/api/update-admin-backoffice',
        config: Controller.updateAdminBackoffice
    },
    {
        method: 'POST',
        path: '/api/delete-admin-backoffice',
        config: Controller.deleteAdminBackoffice
    },
    //FIXME: Organizer
    {
        method : 'GET',
        path : '/api/get-all-organizer-backoffice',
        config : Controller.getAllOrganizerBackoffice
    },
    {
        method: 'POST',
        path: '/api/create-organizer-backoffice',
        config: Controller.createOrganizerBackoffice
    },
    {
        method: 'POST',
        path: '/api/update-organizer-backoffice',
        config: Controller.updateOrganizerBackoffice
    },
    {
        method: 'POST',
        path: '/api/delete-organizer-backoffice',
        config: Controller.deleteOrganizerBackoffice
    },
    //FIXME: Member
    {
        method : 'GET',
        path : '/api/get-all-member-backoffice',
        config : Controller.getAllMemberBackoffice
    },
    {
        method : 'POST',
        path : '/api/create-member-backoffice',
        config : Controller.createMemberBackoffice
    },
    {
        method : 'POST',
        path : '/api/update-member-backoffice',
        config : Controller.updateMemberBackoffice
    },
    {
        method : 'POST',
        path : '/api/delete-member-backoffice',
        config : Controller.deleteMemberBackoffice
    },
    //FIXME: Master-location
    {
        method : 'GET',
        path : '/api/get-all-master-location-backoffice',
        config : Controller.getAllMasterLocationBackoffice
    },
    {
        method: 'POST',
        path: '/api/create-master-location-backoffice',
        config: Controller.createMasterLocationBackoffice
    },
    {
        method : 'POST',
        path : '/api/update-master-location-backoffice',
        config : Controller.updateMasterLocationBackoffice
    },
    {
        method : 'POST',
        path : '/api/delete-master-location-backoffice',
        config : Controller.deleteMasterLocationBackoffice
    },

    // {
    //     method : 'GET',
    //     path : '/api/get-all-master-location-backoffice',

    // },
    // ******************************************************* empty ************************************// 
    {
        method: 'POST',
        path: '/api/test-encrypt',
        config: Controller.cryptTest
    },
    {
        method: 'GET',
        path: '/',
        config: Controller.emptyPath
    }
]

module.exports = routers