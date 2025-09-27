const connection = require("../config/db.config");

module.exports = {
  getAllDetailMonthlyPaymentRateById: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT detail_payment_rate_bulan.*, month.month_name from detail_payment_rate_bulan INNER JOIN month on detail_payment_rate_bulan.month_month_id=month.month_id where payment_rate_id=?",
        id,
        (err, result) => {
          if (!err) {
            resolve(result);
          }
          reject(err);
        }
      );
    }),
  getAllDetailFreePaymentRateById: (id, body) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT detail_payment_rate_bebas.* from detail_payment_rate_bebas where payment_rate_id=?",
        id,
        (err, result) => {
          if (!err) {
            resolve(result);
          }
          reject(err);
        }
      );
    }),
  getAllDetailMonthlyPaymentRateByFilter: (filter) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bulan.* from detail_payment_rate_bulan ${filter}`,
        (err, result) => {
          if (!err) {
            resolve(result);
          }
          reject(err);
        }
      );
    }),
  getAllDetailFreePaymentRateByFilter: (filter) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bebas.* from detail_payment_rate_bebas  ${filter}`,
        (err, result) => {
          if (!err) {
            resolve(result);
          }
          reject(err);
        }
      );
    }),
  postDetailPaymentRate: (setData, query) =>
    new Promise((resolve, reject) => {
      connection.query(query, setData, (error, result) => {
        if (!error) {
          const newData = {
            detail_payment_rate_id: parseInt(result.insertId, 10),
            ...setData,
          };
          resolve(newData);
        } else {
          reject(error);
        }
      });
    }),
  putDetailPaymentRateByStudent: (setData, query) =>
    new Promise((resolve, reject) => {
      connection.query(query, setData, (error, result) => {
        if (!error) {
          const newData = {
            ...setData,
          };
          resolve(newData);
        } else {
          reject(error);
        }
      });
    }),
  putMonthlyDetailPaymentRateByClass: (payment, id) =>
    new Promise((resolve, reject) => {
      connection.query(
        `UPDATE detail_payment_rate_bulan SET payment_rate_bill=${payment} where detail_payment_rate_id IN (${id})`,
        (error, result) => {
          if (!error) {
            const newData = {
              pament_rate_bill: payment,
            };
            resolve(newData);
          } else {
            reject(error);
          }
        }
      );
    }),
  putFreeDetailPaymentRateByClass: (payment, id) =>
    new Promise((resolve, reject) => {
      connection.query(
        `UPDATE detail_payment_rate_bebas SET payment_rate_bill=${payment} where detail_payment_rate_id IN (${id})`,
        (error, result) => {
          if (!error) {
            const newData = {
              pament_rate_bill: payment,
            };
            resolve(newData);
          } else {
            reject(error);
          }
        }
      );
    }),
    postDetailFreePaymentRate: (setData) => new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO detail_payment_rate_bebas SET ?",
      [setData],
      (error, result) => {
        if (!error) {
          // Kita butuh ID dari baris baru ini untuk langkah selanjutnya
          const newData = {
            detail_payment_rate_id: result.insertId,
            ...setData
          };
          resolve(newData);
        } else {
          reject(error);
        }
      }
    );
  }),
};

