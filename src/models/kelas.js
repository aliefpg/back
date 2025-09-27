const connection = require("../config/db.config");

module.exports = {
  getAllKelas: (unitQuery = "") =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT class.*, unit.unit_name as unit_unit_name from class INNER JOIN unit on unit.unit_id=class.unit_unit_id ${unitQuery}`,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    }),
  getKelasByProdi: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT class.*, program_studi.nama FROM kelas INNER JOIN program_studi ON kelas.id_program_studi=program_studi.id_program_studi WHERE kelas.id_program_studi=?",
        id,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    }),
  getKelasById: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM class where class_id=?",
        [id],
        (error, result) => {
          if (!error) {
            resolve(result[0]);
          } else {
            reject(error);
          }
        }
      );
    }),
  postKelas: (setData) =>
    new Promise((resolve, reject) => {
      connection.query("INSERT INTO class set ?", setData, (error, result) => {
        if (!error) {
          const newData = {
            class_id: parseInt(result.insertId, 10),
            ...setData,
          };
          resolve(newData);
        } else {
          reject(error);
        }
      });
    }),
  putKelas: (id, setData) =>
    new Promise((resolve, reject) => {
      connection.query(
        "UPDATE class set ? WHERE class_id=?",
        [setData, id],
        (error, result) => {
          if (!error) {
            const newData = {
              class_id: parseInt(id, 10),
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
  deleteKelas: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "DELETE FROM class WHERE class_id=?",
        id,
        (error, result) => {
          if (!error) {
            const newData = {
              class_id: parseInt(id, 10),
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
