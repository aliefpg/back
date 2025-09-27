const connection = require("../config/db.config");

module.exports = {
  getAllDebitNoSubmittedByRef: (unitId, noRef) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT
        debit.*,
        account1.account_code AS account_cash_account_code,
        account1.account_description AS account_cash_account_desc,
        account2.account_code AS account_cost_account_code,
        account2.account_description AS account_cost_account_desc
    FROM
    debit
    INNER JOIN account account1 ON
        account1.account_id = debit.account_cash_account
    INNER JOIN account account2 ON
        account2.account_id = account_cost_account
    WHERE
    debit.unit_unit_id = ${unitId} AND debit_no_ref = '${noRef}' and debit.is_submit='0'`,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    }),
  getAllDebitSubmitted: (unitId, noRef) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT
        debit.*,
        account1.account_code AS account_cash_account_code,
        account1.account_description AS account_cash_account_desc,
        account2.account_code AS account_cost_account_code,
        account2.account_description AS account_cost_account_desc
    FROM
    debit
    INNER JOIN account account1 ON
        account1.account_id = debit.account_cash_account
    INNER JOIN account account2 ON
        account2.account_id = account_cost_account
    WHERE
       ${unitId && `debit.unit_unit_id = ${unitId} and `}is_submit=1 `,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    }),
  getDebitById: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM debit where debit_id=?",
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
  getDebitDokumenById: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT
        debit.*,
        account1.account_code AS account_cash_account_code,
        account1.account_description AS account_cash_account_desc,
        account2.account_code AS account_cost_account_code,
        account2.account_description AS account_cost_account_desc
    FROM
    debit
    INNER JOIN account account1 ON
        account1.account_id = debit.account_cash_account
    INNER JOIN account account2 ON
        account2.account_id = account_cost_account
    WHERE
    debit_id=?`,
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
  getDebitByNoRef: (noRef) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM debit where debit_no_ref LIKE '${noRef}%' AND is_submit=1 group by debit_no_ref ORDER by debit_no_ref desc`,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    }),
  postDebit: (setData) =>
    new Promise((resolve, reject) => {
      connection.query("INSERT INTO debit set ?", setData, (error, result) => {
        if (!error) {
          const newData = {
            insertId: parseInt(result.insertId, 10),
            ...setData,
          };
          resolve(newData);
        } else {
          reject(error);
        }
      });
    }),
  putDebit: (id, setData) =>
    new Promise((resolve, reject) => {
      connection.query(
        "UPDATE debit set ? WHERE debit_id=?",
        [setData, id],
        (error, result) => {
          if (!error) {
            const newData = {
              debit_id: parseInt(id, 10),
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
  putDebitssByMoreId: (ids, setData) =>
    new Promise((resolve, reject) => {
      connection.query(
        `UPDATE debit set ? WHERE debit_id IN(${ids})`,
        [setData],
        (error, result) => {
          if (!error) {
            const newData = {
              debit_id: ids,
              ...result,
              field: { id: ids, ...setData },
            };
            resolve(newData);
          } else {
            reject(error);
          }
        }
      );
    }),
  deleteDebit: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "DELETE FROM debit WHERE debit_id=?",
        id,
        (error, result) => {
          if (!error) {
            const newData = {
              debit_id: parseInt(id, 10),
              ...result,
            };
            resolve(newData);
          } else {
            reject(error);
          }
        }
      );
    }),
  getAllDebitSubmittedWithDate: (isPrev = false, accountId, tanggal_awal, tanggal_akhir, unitId = "",) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT
          debit.*,
          debit.debit_total as total,
          account2.account_code AS account_code,
          account2.account_description AS account_description,
          account1.account_code AS account_cost_account_code,
          account1.account_description AS account_cost_account_desc
      FROM
          debit
      INNER JOIN account account1 ON
          account1.account_id = debit.account_cash_account
      INNER JOIN account account2 ON
          account2.account_id = account_cost_account
      WHERE debit_date ${isPrev ? `< '${tanggal_awal}'` : `BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}'`} ${accountId != '' ? `AND account1.account_code='${accountId}'` : ''} AND
         ${unitId && `debit.unit_unit_id = ${unitId} AND `}is_submit=1 `,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    }),
};
