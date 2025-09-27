const connection = require("../config/db.config");

module.exports = {
  getAllPaymentRateByPayment: (query) => new Promise((resolve, reject) => {
    connection.query(
      `SELECT * from view_payment_rate ${query}`,
      (err, result) => {
        if (!err) {
          resolve(result);
        }
        reject(err);
      }
    );
  }),
  getPaymentRateById: (id) => new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM view_payment_rate WHERE payment_rate_id=?",
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

  getHeadersAllPaymentRateByStudents: (query) => new Promise((resolve, reject) => {
    connection.query(
      `SELECT * from view_payment_rate ${query}`,
      (err, result) => {
        if (!err) {
          resolve(result);
        }
        reject(err);
      }
    );
  }),
  getPaymentRateByQuery: (query) => new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM view_payment_rate WHERE ${query}`,
      (error, result) => {
        if (!error) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
  }),

  postPaymentRate: (setData) => new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO payment_rate set ?",
      [setData],
      (error, result) => {
        if (!error) {
          const newData = {
            payment_rate_id: parseInt(result.insertId, 10),
            ...result,
            field: { id: parseInt(result.insertId, 10), ...setData },
          };
          resolve(newData);
        } else {
          reject(error);
        }
      }
    );
  }),

  putPaymentRate: (id, setData) => new Promise((resolve, reject) => {
    connection.query(
      "UPDATE payment_rate set ? WHERE payment_rate_id=?",
      [setData, id],
      (error, result) => {
        if (!error) {
          const newData = {
            payment_rate_id: parseInt(id, 10),
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

  deletePaymentRate: (id) => new Promise((resolve, reject) => {
    connection.query(
      "DELETE FROM payment_rate WHERE payment_rate_id=?",
      id,
      (error, result) => {
        if (!error) {
          const newData = {
            payment_rate_id: parseInt(id, 10),
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
