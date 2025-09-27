const connection = require("../config/db.config");

module.exports = {
  // getMonthlyPaymentByStudent: (id) =>
  //   new Promise((resolve, reject) => {
  //     connection.query(
  //       "SELECT * FROM detail_payment_rate_bulan INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id WHERE payment_rate.student_student_id=?",
  //       id,
  //       (error, result) => {
  //         if (!error) {
  //           resolve(result);
  //         } else {
  //           reject(new Error(error));
  //         }
  //       }
  //     );
  //   }),

  postLog: (setData) =>
    new Promise((resolve, reject) => {
      connection.query("INSERT INTO log set ?", [setData], (error, result) => {
        if (!error) {
          const newData = {
            id: parseInt(result.insertId, 10),
            ...result,
            field: { id: parseInt(result.insertId, 10), ...setData },
          };
          resolve(newData);
        } else {
          reject(error);
        }
      });
    }),
};
