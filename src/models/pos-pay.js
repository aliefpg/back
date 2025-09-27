const connection = require("../config/db.config");

module.exports = {
  getAllPosPay: (unitIdQuery) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT pos_pay.pos_pay_id,pos_pay.account_account_id, pos_pay.account_account_code,unit.*, account1.unit_unit_id, pos_pay.account_account_credit,pos_pay.pos_pay_name, pos_pay.pos_pay_description, CONCAT(pos_pay.account_account_code,
        " - ",
        account1.account_description
    ) AS account_code_description,
    CONCAT(
        pos_pay.account_account_credit,
        " - ",
        account2.account_description
    ) AS account_code_credit_description
FROM
    pos_pay
INNER JOIN account account1 ON pos_pay.account_account_id = account1.account_id 
INNER JOIN account account2 ON pos_pay.account_account_credit = account2.account_code 
INNER JOIN unit on unit.unit_id=account1.unit_unit_id

${unitIdQuery}
 GROUP BY pos_pay.pos_pay_id
ORDER BY
    pos_pay.account_account_code
   
DESC
    `,
        (error, result) => {
          if (!error) {
            return resolve(result);
          }
          return reject(error);
        }
      );
    }),
  getPosPayById: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM pos_pay where pos_pay_id=?",
        [id],
        (error, result) => {
          if (!error) {
            return resolve(result[0]);
          }
          return reject(error);
        }
      );
    }),
  getAccountCostByTypeAndId: (code) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM account where account_code LIKE'%${code}%' order by account_code ASC`,
        [],
        (error, result) => {
          if (!error) {
            return resolve(result);
          }
          return reject(error);
        }
      );
    }),
  postPosPay: (setData) =>
    new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO pos_pay SET ?",
        setData,
        (error, result) => {
          if (!error) {
            const newData = {
              pos_pay_id: parseInt(result.insertId, 10),
              ...setData,
            };
            return resolve(newData);
          }
          return reject(error);
        }
      );
    }),
  putPosPay: (id, setData) =>
    new Promise((resolve, reject) => {
      connection.query(
        "UPDATE pos_pay SET ? where pos_pay_id=?",
        [setData, id],
        (error, result) => {
          if (!error) {
            const newData = {
              pos_pay_id: id,
              ...setData,
            };
            return resolve(newData);
          }
          return reject(error);
        }
      );
    }),
  deletePosPay: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "DELETE from pos_pay where pos_pay_id=?",
        id,
        (error, result) => {
          if (!error) {
            const newData = {
              pos_pay_id: id,
            };
            return resolve(newData);
          }
          return reject(error);
        }
      );
    }),
};
