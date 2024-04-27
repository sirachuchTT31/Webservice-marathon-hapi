const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const connectionDatabase = (() => {
    prisma.$connect().then((v) => {
        console.log("connect db success !")
    }).catch((e) => {
        prisma.$disconnect()
    })
})

module.exports = {
    connectionDatabase
}