const connection = require("../config/db.config");

module.exports = {
  getAllCashAccount: (unitIdQuery) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM view_cash_account ${unitIdQuery} order by account_code ASC`,
        (error, result) => {
          if (!error) {
            return resolve(result);
          }
          return reject(error);
        }
      );
    }),
  getAllAktivaAccountCost: (query) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM account where account_type=2 AND account_code LIKE '1-101%' ${query} order by account_code ASC`,
        (error, result) => {
          if (!error) {
            return resolve(result);
          }
          return reject(error);
        }
      );
    }),
  getAllAccountCostByAccountCode: (query) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM account ${query} order by account_code ASC`,
        (error, result) => {
          if (!error) {
            return resolve(result);
          }
          return reject(error);
        }
      );
    }),
  getAllAccountCostPosBayar: (query) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM account ${query} order by account_code ASC`,
        (error, result) => {
          if (!error) {
            return resolve(result);
          }
          return reject(error);
        }
      );
    }),
  getAccountCostById: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM account where account_id=?",
        id,
        (error, result) => {
          if (!error) {
            return resolve(result[0]);
          }
          return reject(error);
        }
      );
    }),
  getAccountCostByTypeAndId: (code, unitIdQuery) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM account where account_code LIKE'%${code}%' ${unitIdQuery} order by account_code ASC`,
        [],
        (error, result) => {
          if (!error) {
            return resolve(result);
          }
          return reject(error);
        }
      );
    }),
  postCashAccount: (setData) =>
    new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO cash_account SET ?",
        setData,
        (error, result) => {
          if (!error) {
            const newData = {
              account_id: parseInt(result.insertId, 10),
              ...setData,
            };
            return resolve(newData);
          }
          return reject(error);
        }
      );
    }),
  putAccountCost: (id, setData) =>
    new Promise((resolve, reject) => {
      connection.query(
        "UPDATE account SET ? where account_id=?",
        [setData, id],
        (error, result) => {
          if (!error) {
            const newData = {
              account_id: id,
              ...setData,
            };
            return resolve(newData);
          }
          return reject(error);
        }
      );
    }),
  deleteAccountCost: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "DELETE from account where account_id=?",
        id,
        (error, result) => {
          if (!error) {
            const newData = {
              account_id: id,
            };
            return resolve(newData);
          }
          return reject(error);
        }
      );
    }),
  //saldo awal
  putSaldoAwal: (id, setData) =>
    new Promise((resolve, reject) => {
      console.log(id);
      console.log(setData);
      connection.query(
        "UPDATE cash_account SET ? where cash_account_id =?",
        [setData, id],
        (error, result) => {
          if (!error) {
            const newData = {
              cash_account_id: id,
              ...setData,
            };
            return resolve(newData);
          }
          return reject(error);
        }
      );
    }),
};
