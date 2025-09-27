const connection = require('../config/db.config');

module.exports = {
  getAllStatus: () => new Promise((resolve, reject) => {
    connection.query('SELECT * from status_siswa', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(error);
      }
    });
  }),
  getStatusByName: (nama) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM status_siswa WHERE status_siswa.nama=?', nama, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(error);
      }
    });
  }),
  getStatusById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM status_siswa where id_status=?', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(error);
      }
    });
  }),
  postStatus: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO status_siswa set ?', setData, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(result.insertId, 10),
          ...setData,
        };
        resolve(newData);
      } else {
        reject(error);
      }
    });
  }),
  putStatus: (id, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE status_siswa set ? WHERE id_status=?', [setData, id], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id, 10),
          ...result,
          field: { id: parseInt(id, 10), ...setData },

        };
        resolve(newData);
      } else {
        reject(error);
      }
    });
  }),
  deleteStatus: (id) => new Promise((resolve, reject) => {
    connection.query('DELETE FROM status_siswa WHERE id_status=?', id, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id, 10),
          ...result,
        };
        resolve(newData);
      } else {
        reject(error);
      }
    });
  }),
};
