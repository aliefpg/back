const connection = require('../config/db.config');

module.exports = {
  getAllTahunAjaran: () => new Promise((resolve, reject) => {
    connection.query('SELECT period.* from period order by period_id ASC', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(error);
      }
    });
  }),

  getTahunAjaranById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM period where period_id=?', [id], (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(error);
      }
    });
  }),
  postTahunAjaran: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO period set ?', setData, (error, result) => {
      if (!error) {
        const newData = {
          period_id: parseInt(result.insertId, 10),
          ...setData,
        };
        resolve(newData);
      } else {
        reject(error);
      }
    });
  }),
  putTahunAjaran: (id, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE period set ? WHERE period_id=?', [setData, id], (error, result) => {
      if (!error) {
        const newData = {
          period_id: parseInt(id, 10),
          ...result,
          field: { id: parseInt(id, 10), ...setData },

        };
        resolve(newData);
      } else {
        reject(error);
      }
    });
  }),
  putTahunAjaranStatusNotIn: (id, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE period set ? WHERE period_id<>?', [setData, id], (error, result) => {
      if (!error) {
        const newData = {
          period_id: parseInt(id, 10),
          ...result,
          field: { id: parseInt(id, 10), ...setData },

        };
        resolve(newData);
      } else {
        reject(error);
      }
    });
  }),
  deleteTahunAjaran: (id) => new Promise((resolve, reject) => {
    connection.query('DELETE FROM period WHERE period_id=?', id, (error, result) => {
      if (!error) {
        const newData = {
          period_id: parseInt(id, 10),
          ...result,
        };
        resolve(newData);
      } else {
        reject(error);
      }
    });
  }),
};
