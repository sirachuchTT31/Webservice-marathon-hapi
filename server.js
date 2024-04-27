const Hapi = require('@hapi/hapi');
const { connectionDatabase } = require('./src/plugin/prisma.js')
const config = require('./src/config/config.js')
const { jwtVerify } = require('./src/api/authentication/authentication.js')
const authenRouters = require('./src/api/routers/authen.router.js')
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

            return { isValid, credentials, artifacts };
        }
    })
    await server.start().then((v) => {
        console.log(`🚀 Server listening ${server.info.uri}🚀`)

    }).catch((e) => {
        console.log(e)
        server.stop()
    })
    connectionDatabase()
}
init();