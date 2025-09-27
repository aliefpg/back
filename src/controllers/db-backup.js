/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
const fs = require("fs");
const path = require("path");
const { promiseHandler } = require("../middleware/promiseHandler");
const helpers = require("../helpers");

module.exports = {
  generateDBBackup: promiseHandler(async (req, res, next) => {
    const dumpFilePath = await helpers.generateDumpSQL();
    const backupFile = path.join(__dirname, "../../backup_db.sql");
    if (dumpFilePath) {
      return res.download(backupFile, "backup_db.sql", (err) => {
        if (err) {
          console.error("Error sending file:", err);
          return helpers.response(res, 500, "GET db gagal",);
        }
        console.log("File sent successfully");
        // return helpers.response(res, 200, "GET db berhasil", { isFetched: true });

        // Optionally, you can delete the file after sending it
      });
    }
    return helpers.response(res, 500, "GET db gagal",);
  },),
};
