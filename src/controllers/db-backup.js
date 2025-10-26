// /* eslint-disable no-unused-vars */
// /* eslint-disable consistent-return */
// const fs = require("fs");
// const path = require("path");
// const { promiseHandler } = require("../middleware/promiseHandler");
// const helpers = require("../helpers");

// module.exports = {
//   generateDBBackup: promiseHandler(async (req, res, next) => {
//     const dumpFilePath = await helpers.generateDumpSQL();
//     const backupFile = path.join(__dirname, "../../backup_db.sql");
//     if (dumpFilePath) {
//       return res.download(backupFile, "backup_db.sql", (err) => {
//         if (err) {
//           console.error("Error sending file:", err);
//           return helpers.response(res, 500, "GET db gagal",);
//         }
//         console.log("File sent successfully");
//         // return helpers.response(res, 200, "GET db berhasil", { isFetched: true });

//         // Optionally, you can delete the file after sending it
//       });
//     }
//     return helpers.response(res, 500, "GET db gagal",);
//   },),
// };
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

module.exports = {
  generateDBBackup: async (req, res) => {
    try {
      // Lokasi file backup sementara
      const dumpPath = path.join(__dirname, "..", "..", "backup_db.sql");

      // Ambil konfigurasi dari .env
      const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

      // Perintah mysqldump (MySQL)
      const command = `mysqldump -h ${DB_HOST} -u ${DB_USER} -p"${DB_PASSWORD}" ${DB_NAME} > "${dumpPath}"`;

      console.log("🟢 Menjalankan perintah:", command);

      exec(command, (error) => {
        if (error) {
          console.error("❌ Gagal membuat backup:", error);
          return res.status(500).send("Gagal membuat backup database.");
        }

        // Pastikan file hasil dump ada
        if (fs.existsSync(dumpPath)) {
          // Kirim file hasil dump ke frontend
          res.download(dumpPath, "backup_db.sql", (err) => {
            if (err) {
              console.error("❌ Gagal mengirim file:", err);
              return res.status(500).send("Gagal mengirim file backup.");
            }

            console.log("✅ File backup berhasil dikirim.");

            // (Opsional) hapus file setelah dikirim biar bersih
            // fs.unlinkSync(dumpPath);
          });
        } else {
          res.status(404).send("File backup tidak ditemukan.");
        }
      });
    } catch (err) {
      console.error("🔥 Error di generateDBBackup:", err);
      res.status(500).send("Terjadi kesalahan server.");
    }
  },
};
