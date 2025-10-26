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

const fs = require("fs");
const path = require("path");
const db = require("../config/db.config");

module.exports = {
  generateDBBackup: async (req, res) => {
    try {
      // Ambil semua tabel dari database
      const [tables] = await db.promise().query("SHOW TABLES");
      const dbName = process.env.DB_NAME;
      const key = Object.keys(tables[0])[0];

      let sqlDump = `-- Backup Database: ${dbName}\n-- Generated at: ${new Date().toISOString()}\n\n`;

      for (const table of tables) {
        const tableName = table[key];
        sqlDump += `-- --------------------------------------------------------\n`;
        sqlDump += `-- Table structure for \`${tableName}\`\n`;
        sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;

        // Ambil struktur tabel
        const [createStmt] = await db.promise().query(`SHOW CREATE TABLE \`${tableName}\``);
        sqlDump += `${createStmt[0]["Create Table"]};\n\n`;

        // Ambil semua data tabel
        const [rows] = await db.promise().query(`SELECT * FROM \`${tableName}\``);
        if (rows.length > 0) {
          sqlDump += `-- Dumping data for table \`${tableName}\`\n`;
          for (const row of rows) {
            const columns = Object.keys(row)
              .map((col) => `\`${col}\``)
              .join(", ");
            const values = Object.values(row)
              .map((val) => (val === null ? "NULL" : `'${val.toString().replace(/'/g, "''")}'`))
              .join(", ");
            sqlDump += `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values});\n`;
          }
          sqlDump += "\n";
        }
      }

      // Simpan sementara ke file
      const dumpPath = path.join("/tmp", "backup_db.sql");

      fs.writeFileSync(dumpPath, sqlDump);

      // Kirim file ke frontend
      res.download(dumpPath, "backup_db.sql", (err) => {
        if (err) {
          console.error("❌ Gagal mengirim file:", err);
          res.status(500).send("Gagal mengirim file backup.");
        } else {
          console.log("✅ Backup database berhasil dikirim.");
          // (opsional) hapus file setelah dikirim
          fs.unlinkSync(dumpPath);
        }
      });
    } catch (err) {
      console.error("🔥 Error di generateDBBackup:", err);
      res.status(500).send("Terjadi kesalahan saat membuat backup database.");
    }
  },
};
