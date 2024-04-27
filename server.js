const Hapi = require('@hapi/hapi');
const { connectionDatabase } = require('./src/plugin/prisma.js')
const authenRouters = require('./src/api/routers/authen.router.js')
const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
    })
    server.start().then((v) => {
        console.log(`🚀 Server listening ${server.info.uri}🚀`)

    }).catch((e) => {
        console.log(e)
        server.stop()
    })
    connectionDatabase()
    authenRouters.forEach((path) => server.route(path))
    // routers.forEach((path) => server.route(path))
}
init();