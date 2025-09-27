const connection = require("../config/db.config");

module.exports = {
  getAllProgramStudi: (query) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT majors.*, unit.unit_name as unit_unit_name from majors INNER JOIN unit on unit.unit_id=majors.unit_unit_id ${query}`,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    }),
  getProdiById: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT * from majors WHERE majors_id=?",
        id,
        (error, result) => {
          if (!error) {
            resolve(result[0]);
          } else {
            reject(error);
          }
        }
      );
    }),
  postProgramStudi: (setData) =>
    new Promise((resolve, reject) => {
      connection.query("INSERT INTO majors set ?", setData, (error, result) => {
        if (!error) {
          const newData = {
            majors_id: parseInt(result.insertId, 10),
            ...setData,
          };
          resolve(newData);
        } else {
          reject(error);
        }
      });
    }),
  putProgramStudi: (id, setData) =>
    new Promise((resolve, reject) => {
      connection.query(
        "UPDATE majors set ? WHERE majors_id=?",
        [setData, id],
        (error, result) => {
          if (!error) {
            const newData = {
              majors_id: parseInt(id, 10),
              ...result,
              field: { id: parseInt(id, 10), ...setData },
            };
            resolve(newData);
          } else {
            reject(error);
          }
        }
      );
    }),
  deleteProgramStudi: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "DELETE FROM majors WHERE majors_id=?",
        id,
        (error, result) => {
          if (!error) {
            const newData = {
              majors_id: parseInt(id, 10),
              ...result,
            };
            resolve(newData);
          } else {
            reject(error);
          }
        }
      );
    }),
};
