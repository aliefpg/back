const connection = require("../config/db.config");

module.exports = {
  getPaymentTransactionByStudent: (id, { period_start, period_end }) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT view_payment.*,view_payment_rate.*,unit.unit_name FROM view_payment INNER JOIN view_payment_rate ON view_payment.payment_id=view_payment_rate.payment_payment_id INNER JOIN unit ON view_payment.unit_unit_id=unit.unit_id WHERE view_payment_rate.student_student_id=? AND (view_payment.period_start like '%${[
          period_start,
        ]}%' AND view_payment.period_end LIKE '%${period_end}%')`,
        id,
        (error, result) => {
          if (!error) {
            resolve(result[0]);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getAllPaymentTransactionStudents: ({ period_start, period_end }) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT view_payment.*,view_payment_rate.*,unit.unit_name FROM view_payment INNER JOIN view_payment_rate ON view_payment.payment_id=view_payment_rate.payment_payment_id INNER JOIN unit ON view_payment.unit_unit_id=unit.unit_id WHERE  (view_payment.period_start like '%${[
          period_start,
        ]}%' AND view_payment.period_end LIKE '%${period_end}%')`,
        id,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getFreePaymentNotSubmitted: (id) =>
    new Promise((resolve, reject) =>
      connection.query(
        `SELECT detail_payment_rate_bebas_pay.*,pos_pay.*,unit.unit_name,period.period_start,period.period_end,payment.* FROM detail_payment_rate_bebas_pay INNER JOIN detail_payment_rate_bebas ON detail_payment_rate_bebas.detail_payment_rate_id=detail_payment_rate_bebas_pay.detail_payment_rate_id INNER JOIN payment_rate ON detail_payment_rate_bebas.payment_rate_id=payment_rate.payment_rate_id INNER JOIN payment ON payment.payment_id=payment_rate.payment_payment_id INNER JOIN pos_pay ON pos_pay.pos_pay_id=payment.pos_pos_id INNER JOIN unit ON unit.unit_id=payment.unit_unit_id INNER JOIN period ON payment.period_period_id=period.period_id  WHERE payment_rate.student_student_id=${id} AND detail_payment_rate_bebas_pay.is_submit_payment=0 AND detail_payment_rate_bebas_pay.payment_rate_bebas_pay_number IS NOT NULL`,
        id,
        (error, result) => {
          if (!error) {
            resolve(result);
          }
          reject(new Error(error));
        }
      )
    ),
  putFreePaymentSubmit: (setData, id) =>
    new Promise((resolve, reject) =>
      connection.query(
        `UPDATE detail_payment_rate_bebas_pay SET ? WHERE payment_rate_bebas_pay_id IN (${id})`,
        setData,
        (error, result) => {
          if (!error) {
            resolve(result);
          }
          reject(new Error(error));
        }
      )
    ),
  putMonthlyPaymentSubmit: (setData, id) =>
    new Promise((resolve, reject) =>
      connection.query(
        `UPDATE detail_payment_rate_bulan SET ? WHERE detail_payment_rate_id IN (${id})`,
        setData,
        (error, result) => {
          if (!error) {
            resolve(result);
          }
          reject(new Error(error));
        }
      )
    ),
  getMonthlyPaymentNotSubmitted: (id) =>
    new Promise((resolve, reject) =>
      connection.query(
        `SELECT detail_payment_rate_bulan.*,pos_pay.*,unit.unit_name,period.period_start,payment.*,period.period_end,month.month_name FROM detail_payment_rate_bulan INNER JOIN payment_rate ON detail_payment_rate_bulan.payment_rate_id=payment_rate.payment_rate_id INNER JOIN payment ON payment.payment_id=payment_rate.payment_payment_id INNER JOIN pos_pay ON pos_pay.pos_pay_id=payment.pos_pos_id INNER JOIN unit ON unit.unit_id=payment.unit_unit_id INNER JOIN period ON payment.period_period_id=period.period_id INNER JOIN month on month.month_id=detail_payment_rate_bulan.month_month_id  WHERE payment_rate.student_student_id=${id} AND detail_payment_rate_bulan.is_submit_payment=0 AND detail_payment_rate_bulan.payment_rate_number_pay IS NOT NULL`,
        id,
        (error, result) => {
          if (!error) {
            resolve(result);
          }
          reject(new Error(error));
        }
      )
    ),
  getReferensiCodeMonthly: (table, query) =>
    new Promise((resolve, reject) =>
      connection.query(
        `SELECT ${table}.* from ${table} INNER JOIN payment_rate ON payment_rate.payment_rate_id=${table}.payment_rate_id ${query}`,
        (error, result) => {
          if (!error) {
            resolve(result);
          }
          reject(new Error(error));
        }
      )
    ),
  getReferensiCodeFree: (query) =>
    new Promise((resolve, reject) =>
      connection.query(
        `SELECT detail_payment_rate_bebas_pay.* from detail_payment_rate_bebas_pay INNER JOIN detail_payment_rate_bebas ON detail_payment_rate_bebas_pay.detail_payment_rate_id=detail_payment_rate_bebas.detail_payment_rate_id INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bebas.payment_rate_id ${query}`,
        (error, result) => {
          if (!error) {
            resolve(result);
          }
          reject(new Error(error));
        }
      )
    ),
};
