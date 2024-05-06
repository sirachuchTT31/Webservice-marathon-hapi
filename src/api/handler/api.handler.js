const fs = require('fs');
const HandleruploadImageEvent = async (data) => {
    try {
        const payload = data;
        const typeFile = payload.files.hapi.filename.split('.')[1]
        let math = Math.random() * 10000000
        let newMath = Math.ceil(math);
        let newPathFile = 'D:/project_clone_git/marathon_v2_web/src/assets/img/reg_by_organizer/' + String(newMath) + '.' + typeFile;
        await fs.promises.writeFile(newPathFile, payload.files._data, function (err) {
            if (err) throw err;
        });
        return '../../../../assets/img/reg_by_organizer/' + String(newMath) + '.' + typeFile;
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = {
    HandleruploadImageEvent
}