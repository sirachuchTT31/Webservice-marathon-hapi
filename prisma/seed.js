const seedMaster = require("./seed/master-data.json");
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
    await prisma.$transaction(async (tx) => {
        for (const data of seedMaster.ROLE) {
            await tx.role.upsert({
                create: {
                    name: data.name
                },
                update: {
                    name: data.name
                },
                where: {
                    name: data.name
                }
            });
        }

        for (const data of seedMaster.LOCATION) {
            await tx.masterLocation.upsert({
                create: {
                    address: data.address,
                    district: data.district,
                    province: data.province,
                    zipcode: data.zipcode,
                    is_active: data.is_active
                },
                update: {
                    address: data.address,
                    district: data.district,
                    province: data.province,
                    zipcode: data.zipcode,
                    is_active: data.is_active
                },
                where: {
                    province: data.province
                }
            });

            const findRole = await tx.role.findFirst({
                where: {
                    name: 'admin'
                }
            });

            await tx.users.upsert({
                create: {
                    username: seedMaster.ADMIN_ACCOUNT.username,
                    password: seedMaster.ADMIN_ACCOUNT.password,
                    avatar: seedMaster.ADMIN_ACCOUNT.avatar,
                    access_status: seedMaster.ADMIN_ACCOUNT.access_status,
                    email: seedMaster.ADMIN_ACCOUNT.email,
                    name: seedMaster.ADMIN_ACCOUNT.name,
                    lastname: seedMaster.ADMIN_ACCOUNT.lastname,
                    UserOnRole: {
                        create: {
                            role_id: findRole.id
                        }
                    }
                },
                update: {
                    username: seedMaster.ADMIN_ACCOUNT.username,
                    password: seedMaster.ADMIN_ACCOUNT.password,
                    avatar: seedMaster.ADMIN_ACCOUNT.avatar,
                    access_status: seedMaster.ADMIN_ACCOUNT.access_status,
                    email: seedMaster.ADMIN_ACCOUNT.email,
                    name: seedMaster.ADMIN_ACCOUNT.name,
                    lastname: seedMaster.ADMIN_ACCOUNT.lastname,
                    UserOnRole: {
                        create: {
                            role_id: findRole.id
                        }
                    }
                },
                where: {
                    username: seedMaster.ADMIN_ACCOUNT.username
                }
            })
        }

    });

    console.log(`Seed data is successfully`);
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })