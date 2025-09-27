require("dotenv");
const crypto = require("crypto");

const algorithm = "aes-256-cbc"; //Using AES encryption
const key = process.env.ENCRYPTION_KEY;
const iv = crypto.randomBytes(16);
module.exports = {
  encryptData: (text) => {
    //Checking the crypto module

    //Encrypting text

    let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
      iv: iv.toString("hex"),
      encryptedData: encrypted.toString("hex"),
    };
  },
  decryptData: (text) => {
    try {
      let iv = Buffer.from(text.iv, "hex");
      let encryptedText = Buffer.from(text.encryptedData, "hex");
      let decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(key),
        iv
      );
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (error) {
      console.log(error);
    }
  },
};
