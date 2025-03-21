const StatusUserRegisterEvent = {
    WAIT_FOR_APPROVED: '11',
    WAIT_FOR_PAYMENT: '12',
    REJECT: '13',
    // จะไปออกใบเสร็จ
    APPROVED_SUCCESS: '14',
    SAVE: '15',
    CANCEL: '00'
}

const StatusUserPayment = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECT: 'reject'
}

module.exports = {
    StatusUserRegisterEvent,
    StatusUserPayment
}