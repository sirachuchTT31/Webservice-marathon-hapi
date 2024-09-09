const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const primsa = new PrismaClient()
const _ = require('underscore')
const Logger = require('pino')

const taskUpdateEvent = () => {
    try {
        //🚀 ~ every 20 minutes
        cron.schedule('*/20 * * * *', async () => {
            console.log("🚀 ~ start batch:")
            let currentDate = new Date()
            await primsa.$transaction(async (tx) => {
                //Auto update due date status 01 Cancel 
                const findWhereDuedate = await tx.event.findMany({
                    where: {
                        AND: [
                            {
                                due_date: {
                                    lt: currentDate
                                },
                            },
                            {
                                status_code: {
                                    equals: '01'
                                }
                            }
                        ]
                    },
                });
                if (!_.isEmpty(findWhereDuedate)) {
                    for (const item of findWhereDuedate) {
                        await tx.event.update({
                            where: {
                                id: item.id
                            },
                            data: {
                                status_code: '04',
                            },
                        });
                    }
                }
                //Job success 02 status to finish 05
                const findWhereSuccessJob = await tx.event.findMany({
                    where: {
                        AND: [
                            {
                                due_date: {
                                    lt: currentDate
                                },
                            },
                            {
                                status_code: {
                                    equals: '02'
                                }
                            }
                        ]
                    }
                });
                if (!_.isEmpty(findWhereSuccessJob)) {
                    for (const item of findWhereSuccessJob) {
                        await tx.event.update({
                            where: {
                                id: item.id
                            },
                            data: {
                                status_code: '05'
                            }
                        })
                    }
                }
                return _.isEmpty(findWhereDuedate) ? false : true
            });
            console.log("🚀 ~ Batch run task event:",)
        });
    }
    catch (e) {
        console.log(e)
    }
}

const taskUpdateRegisterEventUser = () => {
    try {
        cron.schedule('*/1 * * * *', async () => {
            console.log("🚀 ~ start batch payment user ")
            let currentDate = new Date()
            await primsa.$transaction(async (tx) => {
                const findPaymentDuedate = await tx.userOnEventJoin.findMany({
                    where: {
                        AND: [
                            {
                                due_date: {
                                    lt: currentDate
                                },
                            },
                            {
                                status_code: {
                                    equals: '13'
                                }
                            }
                        ]
                    }
                });
                if (!_.isEmpty(findPaymentDuedate)) {
                    for (const data of findPaymentDuedate) {
                        await tx.userOnEventJoin.update({
                            where: {
                                event_join_id: Number(data.event_join_id)
                            },
                            data: {
                                status_code: '00'
                            }
                        });
                    }
                }
            });

            console.log("🚀 ~ Batch run task payment user: ")
        });
    }
    catch (e) {
        Logger.error(e.message)
    }
}

const taskUppdateStatusUserHistory = () => {
    try {
        cron.schedule('*/1 * * * *', async () => {
            console.log("🚀 ~ start trigger status user history ")
            let currentDate = new Date();
            await primsa.$transaction(async (tx) => {
                const findUserHistory = await tx.userOnEventJoin.findMany({
                    where: {
                        AND: [
                            {
                                EventJoin: {
                                    Event: {
                                        due_date: {
                                            lt: currentDate
                                        }
                                    }
                                }
                            },
                            {
                                status_code: {
                                    equals: '11'
                                }
                            }
                        ]
                    }
                });

                console.log(findUserHistory)

                if (!_.isEmpty(findUserHistory)) {
                    for (const data of findUserHistory) {
                        await tx.userOnEventJoin.updateMany({
                            where: {
                                event_join_id: Number(data.event_join_id)
                            },
                            data: {
                                status_code: '00'
                            }
                        });
                    }
                }
            });
            console.log("🚀 ~ Batch run task trigger status user history  ")
        })

    }
    catch (e) {
        console.log(`Batch run task trigger status user history Logger Error ~~~ ${e}`)
    }
}

module.exports = {
    taskUpdateEvent,
    taskUpdateRegisterEventUser,
    taskUppdateStatusUserHistory
}