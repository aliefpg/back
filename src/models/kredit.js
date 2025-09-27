const connection = require("../config/db.config");

module.exports = {
  getAllKredit: (unitQuery = "") =>
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
  getAllKreditSubmittedWithDate: (isPrev, accountId, tanggal_awal, tanggal_akhir, unitId = "",) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT
        kredit.*,
        kredit.kredit_total as total_keluar,
        account2.account_code AS account_code,
        account2.account_description AS account_description,
        account1.account_code AS account_cost_account_code,
        account1.account_description AS account_cost_account_desc
    FROM
        kredit
    INNER JOIN account account1 ON
        account1.account_id = kredit.account_cash_account
    INNER JOIN account account2 ON
        account2.account_id = account_cost_account
    WHERE kredit_date ${isPrev ? `< '${tanggal_awal}'` : `BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}'`} ${accountId != '' ? `AND account1.account_code='${accountId}'` : ''} AND
       ${unitId && `kredit.unit_unit_id = ${unitId} AND `}is_submit=1 `,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    }),
  getAllKreditNoSubmittedByRef: (unitId, noRef) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT
        kredit.*,
        account1.account_code AS account_cash_account_code,
        account1.account_description AS account_cash_account_desc,
        account2.account_code AS account_cost_account_code,
        account2.account_description AS account_cost_account_desc
    FROM
        kredit
    INNER JOIN account account1 ON
        account1.account_id = kredit.account_cash_account
    INNER JOIN account account2 ON
        account2.account_id = account_cost_account
    WHERE
        kredit.unit_unit_id = ${unitId} AND kredit_no_ref = '${noRef}' AND kredit.is_submit='0'`,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    }),
  getAllKreditSubmitted: (unitId, noRef) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT
        kredit.*,
        account1.account_code AS account_cash_account_code,
        account1.account_description AS account_cash_account_desc,
        account2.account_code AS account_cost_account_code,
        account2.account_description AS account_cost_account_desc
    FROM
        kredit
    INNER JOIN account account1 ON
        account1.account_id = kredit.account_cash_account
    INNER JOIN account account2 ON
        account2.account_id = account_cost_account
    WHERE
       ${unitId && `kredit.unit_unit_id = ${unitId} and `}is_submit=1 `,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    }),
  getKreditById: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM kredit where kredit_id=?",
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
  getKreditByNoRef: (noRef) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM kredit where kredit_no_ref LIKE '${noRef}%' AND is_submit=1 group by kredit_no_ref ORDER by kredit_no_ref desc`,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    }),
  getKreditDokumenById: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT
        kredit.*,
        account1.account_code AS account_cash_account_code,
        account1.account_description AS account_cash_account_desc,
        account2.account_code AS account_cost_account_code,
        account2.account_description AS account_cost_account_desc
    FROM
    kredit
    INNER JOIN account account1 ON
        account1.account_id = kredit.account_cash_account
    INNER JOIN account account2 ON
        account2.account_id = account_cost_account
    WHERE
    kredit_id=?`,
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
  postKredit: (setData) =>
    new Promise((resolve, reject) => {
      connection.query("INSERT INTO kredit set ?", setData, (error, result) => {
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
  putKredit: (id, setData) =>
    new Promise((resolve, reject) => {
      connection.query(
        "UPDATE kredit set ? WHERE kredit_id=?",
        [setData, id],
        (error, result) => {
          if (!error) {
            const newData = {
              kredit_id: parseInt(id, 10),
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
  putKreditsByMoreId: (ids, setData) =>
    new Promise((resolve, reject) => {
      connection.query(
        `UPDATE kredit set ? WHERE kredit_id IN(${ids})`,
        [setData],
        (error, result) => {
          if (!error) {
            const newData = {
              kredit_id: ids,
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
  deleteKredit: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "DELETE FROM kredit WHERE kredit_id=?",
        id,
        (error, result) => {
          if (!error) {
            const newData = {
              kredit_id: parseInt(id, 10),
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
