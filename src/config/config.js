const Bearertoken = require('hapi-auth-bearer-token')
const Jwt2 = require('hapi-auth-jwt2');
const Inert  = require('@hapi/inert')
const Basic = require('@hapi/basic');
const routerPlugin = require('../plugin/routers.js');
const Vision = require('@hapi/vision')
const { swagger } = require('../plugin/swagger.js')
const { connectionDatabase } = require('../plugin/prisma.js')
module.exports = {
    server: {
        connection: {
            host: process.env.HOST,
            port: process.env.PORT,
            routers: {
                cors: {
                    origin: ['*'],
                    credentials: true,
                    additionalHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Request-Method', 'Access-Control-Allow-Methods', 'language', 'network', 'Access-Control-Allow-Headers', 'Authorization'],
                    headers: ['Accept', 'Content-Type'],
                }
            }
        },
    },
    register: [
        routerPlugin.plugin,
        // connectionDatabase,
        Bearertoken,
        Jwt2,
        // inert,
        // require('@hapi/inert'),
        Inert,
        Vision,
        Basic,
        swagger
    ]
}