const Pack = require('../../package.json')
const HapiSwagger = require('hapi-swagger')

module.exports = {
    swagger : {
        plugin : HapiSwagger,
        options : {
            info : {
                title : 'Swagger API Vesion 1.0.0',
                version : Pack.version
            },
            securityDefinitions: {
                bearer: {
                  type: 'apiKey',
                  name: 'Authorization',
                  in: 'header'
                }
            },
            security: [{ bearer: [] }],
            schemes: ['http','https']
        }
    }
}