const connection = require('../config/db.config');

module.exports = {
  getAllAlumni: (query) => new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM view_student ${query == '' ? '' : `WHERE ${query}`}`, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(error);
      }
    });
  }),
  getAlumniById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_student WHERE student_status=2 AND student_id=?', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(error);
      }
    });
  }),

  // postSiswa: (setData) => new Promise((resolve, reject) => {
  //   connection.query('INSERT INTO student set ?', setData, (error, result) => {
  //     if (!error) {
  //       const newData = {
  //         student_id: parseInt(result.insertId, 10),
  //         ...setData,
  //       };
  //       resolve(newData);
  //     } else {
  //       reject(error);
  //     }
  //   });
  // }),
  putAlumni: (id, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE student set ? WHERE student_id=?', [setData, id], (error, result) => {
      if (!error) {
        const newData = {
          student_id: parseInt(id, 10),
          ...result,
          field: { id: parseInt(id, 10), ...setData },

        };
        resolve(newData);
      } else {
        reject(error);
      }
    });
  }),
  putStatusSiswa: (id, setData) => new Promise((resolve, reject) => {
    connection.query(`UPDATE student set ? WHERE student_id IN ${id}`, [setData], (error, result) => {
      if (!error) {
        const newData = {
          student_id: parseInt(id, 10),
          ...result,
          field: { id: parseInt(id, 10), ...setData },

        };
        resolve(newData);
      } else {
        reject(error);
      }
    });
  }),
  deletSiswa: (id) => new Promise((resolve, reject) => {
    connection.query('DELETE FROM student WHERE student_id=?', id, (error, result) => {
      if (!error) {
        const newData = {
          student_id: parseInt(id, 10),
          ...result,
        };
        resolve(newData);
      } else {
        reject(error);
      }
    });
  }),
};
