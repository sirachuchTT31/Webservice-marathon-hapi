const CryptoJS = require("crypto-js");

const encryptAES = async (text) => {
    try {
        const ciphertext = CryptoJS.AES.encrypt(String(text), process.env.SECRET_KEY).toString();
        return ciphertext ? ciphertext  :""
    }
    catch (e) {
        console.log(e)
    }
}

const decryptAES = async (cipher) => {
    try {
        const bytes = CryptoJS.AES.decrypt(String(cipher), process.env.SECRET_KEY);
        const originalData = bytes.toString(CryptoJS.enc.Utf8);
        return originalData ? originalData : ""
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = {
    encryptAES,
    decryptAES
}