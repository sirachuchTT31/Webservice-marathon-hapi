const generateINV  = (userId) => {
    const date = new Date();
    return `INV-${userId}${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}${date.getHours()}${date.getMinutes()}`
}

module.exports ={
    generateINV
}