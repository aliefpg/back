// src/models/waConfigModel.js

// Impor koneksi database Anda. Sesuaikan path jika perlu.
const db = require("../config/db.config.js");

module.exports = {
  /**
     * Mengambil semua baris dari tabel wa_notification_configs
     */
  getAll: () => new Promise((resolve, reject) => {
    const sql = "SELECT * FROM wa_notification_configs";
    db.query(sql, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  }),

  /**
     * Memperbarui satu baris konfigurasi berdasarkan tipenya
     * @param {string} notificationType - Tipe notifikasi yang akan diupdate
     * @param {object} data - Data baru yang akan disimpan
     */
  update: (notificationType, data) => new Promise((resolve, reject) => {
    const sql = "UPDATE wa_notification_configs SET ? WHERE notification_type = ?";
    db.query(sql, [data, notificationType], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  })
};
