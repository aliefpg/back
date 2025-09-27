const connection = require("../config/db.config");

module.exports = {
  getAllActiveSiswa: (unitIds) => new Promise((resolve, reject) => {
    connection.query(
      `SELECT count(student_id) as jumlah_siswa_aktif FROM view_student where student_status=1 and unit_unit_id IN(${unitIds})`,
      (error, result) => {
        if (!error) {
          resolve(result[0]);
        } else {
          reject(error);
        }
      }
    );
  }),
};
