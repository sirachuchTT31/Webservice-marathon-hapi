const moment = require("moment");
const CovertToDate = (date) => {
    if (date) {
        const [day, month, year] = date.split('-')
        const YYMMDD = `${year}-${month}-${day}`
        return new Date(YYMMDD)
    }
}

module.exports = {
    CovertToDate
}