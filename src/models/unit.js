const connection = require("../config/db.config");

module.exports = {
  getAllUnit: () =>
    new Promise((resolve, reject) => {
      connection.query("SELECT * from unit", (error, result) => {
        if (!error) {
          resolve(result);
        } else {
          reject(error);
        }
      });
    }),
  getUnitById: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT * from unit WHERE unit_id=?",
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
  getUnitByUser: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT unit.* from unit WHERE users_users_id=?",
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
  updateUnit: (setData, id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "UPDATE unit set ? where unit_id=?",
        [setData, id],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    }),
  // getKelasById: (id) =>
  //   new Promise((resolve, reject) => {
  //     connection.query(
  //       "SELECT * FROM class where class_id=?",
  //       id,
  //       (error, result) => {
  //         if (!error) {
  //           resolve(result[0]);
  //         } else {
  //           reject(error);
  //         }
  //       }
  //     );
  //   }),
  // postKelas: (setData) =>
  //   new Promise((resolve, reject) => {
  //     connection.query("INSERT INTO class set ?", setData, (error, result) => {
  //       if (!error) {
  //         const newData = {
  //           class_id: parseInt(result.insertId, 10),
  //           ...setData,
  //         };
  //         resolve(newData);
  //       } else {
  //         reject(error);
  //       }
  //     });
  //   }),
  // putKelas: (id, setData) =>
  //   new Promise((resolve, reject) => {
  //     connection.query(
  //       "UPDATE class set ? WHERE class_id=?",
  //       [setData, id],
  //       (error, result) => {
  //         if (!error) {
  //           const newData = {
  //             class_id: parseInt(id, 10),
  //             ...result,
  //             field: { id: parseInt(id, 10), ...setData },
  //           };
  //           resolve(newData);
  //         } else {
  //           reject(error);
  //         }
  //       }
  //     );
  //   }),
  // deleteKelas: (id) =>
  //   new Promise((resolve, reject) => {
  //     connection.query(
  //       "DELETE FROM class WHERE class_id=?",
  //       id,
  //       (error, result) => {
  //         if (!error) {
  //           const newData = {
  //             class_id: parseInt(id, 10),
  //             ...result,
  //           };
  //           resolve(newData);
  //         } else {
  //           reject(error);
  //         }
  //       }
  //     );
  //   }),
};
