const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const primsa = new PrismaClient()
const _ = require('underscore')

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

module.exports = {
    taskUpdateEvent
}