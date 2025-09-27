const connection = require("../config/db.config");

module.exports = {
  getAllDetailByPaymentId: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT detail_payment_rate_bebas_pay.*,account.account_description as payment_rate_via_name FROM detail_payment_rate_bebas_pay LEFT JOIN account ON account.account_id=detail_payment_rate_bebas_pay.payment_rate_via where detail_payment_rate_id=?",
        id,
        (err, result) => {
          if (!err) {
            resolve(result);
          }
          reject(err);
        }
      );
    }),
  getAllDetailByRangePaymentId: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT detail_payment_rate_bebas_pay.*,account.account_description as payment_rate_via_name FROM detail_payment_rate_bebas_pay LEFT JOIN account ON account.account_id=detail_payment_rate_bebas_pay.payment_rate_via where detail_payment_rate_id IN(?)",
        id,
        (err, result) => {
          if (!err) {
            resolve(result);
          }
          reject(err);
        }
      );
    }),
  deleteDetailTransaction: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "DELETE from detail_payment_rate_bebas_pay where payment_rate_bebas_pay_id=?",
        id,
        (err, result) => {
          if (!err) {
            resolve(result);
          }
          reject(err);
        }
      );
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
};
