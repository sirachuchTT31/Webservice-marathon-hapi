const Hapi = require('@hapi/hapi');
const { connectionDatabase } = require('./src/plugin/prisma.js')
const config = require('./src/config/config.js')
const _ = require('underscore');
const Boom = require('@hapi/boom')
const { jwtVerify } = require('./src/api/authentication/authentication.js')
const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
    })
    await server.register(config.register)
    server.auth.strategy('jwt', 'bearer-access-token', {
        validate: async (request, token, h) => {
            const { isValid, result } = await jwtVerify(token, process.env.ACCESS_TOKEN_SECRET)
            const credentials = { token };
            const artifacts = { ...result };
            
            if(_.isEmpty(artifacts)){
                return Boom.unauthorized()
            }
            return { isValid, credentials, artifacts };
        }
    })
    server.auth.default('jwt');
    await server.start().then((v) => {
        console.log(`🚀 Server listening ${server.info.uri}🚀`)

    }).catch((e) => {
        console.log(e)
        server.stop()
    })
    connectionDatabase()
}
init();