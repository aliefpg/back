const connection = require("../config/db.config");

module.exports = {
  getMonthlyPaymentByStudent: (id, period_start = "", period_end = "") =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bulan.*,view_payment.*, account.account_description as payment_rate_via_name,month.month_name FROM detail_payment_rate_bulan INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id INNER JOIN month on month.month_id=detail_payment_rate_bulan.month_month_id INNER JOIN view_payment ON view_payment.payment_id=payment_rate.payment_payment_id LEFT JOIN account ON account.account_id=detail_payment_rate_bulan.payment_rate_via WHERE payment_rate.student_student_id=? AND period_start LIKE '%${period_start}%' AND period_end LIKE '%${period_end}%' order by month_id`,
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
  getMonthlyPaymentAllStudent: (period_start = "", period_end = "") =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bulan.*,view_payment.*, account.account_description as payment_rate_via_name,month.month_name FROM detail_payment_rate_bulan INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id INNER JOIN month on month.month_id=detail_payment_rate_bulan.month_month_id INNER JOIN view_payment ON view_payment.payment_id=payment_rate.payment_payment_id LEFT JOIN account ON account.account_id=detail_payment_rate_bulan.payment_rate_via WHERE period_start LIKE '%${period_start}%' AND period_end LIKE '%${period_end}%' order by month_id`,

        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getMonthlyPaymentByReferenceNumber: (id, noRef) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bulan.*,view_payment.*, account.account_description as payment_rate_via_name,month.month_name FROM detail_payment_rate_bulan INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id INNER JOIN month on month.month_id=detail_payment_rate_bulan.month_month_id INNER JOIN view_payment ON view_payment.payment_id=payment_rate.payment_payment_id LEFT JOIN account ON account.account_id=detail_payment_rate_bulan.payment_rate_via WHERE payment_rate.student_student_id=? AND payment_rate_number_pay=? order by month_id`,
        [id, noRef],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getMonthlyPaymentByReference: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bulan.*,view_payment.*, account.account_description as payment_rate_via_name,month.month_name FROM detail_payment_rate_bulan INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id INNER JOIN month on month.month_id=detail_payment_rate_bulan.month_month_id INNER JOIN view_payment ON view_payment.payment_id=payment_rate.payment_payment_id LEFT JOIN account ON account.account_id=detail_payment_rate_bulan.payment_rate_via WHERE payment_rate.student_student_id=? order by month_id`,
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
  getHistoryMonthlyPaymentByStudent: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT detail_payment_rate_bulan.*,account.account_description as payment_rate_via_name,month.month_name FROM detail_payment_rate_bulan INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id INNER JOIN month on month.month_id=detail_payment_rate_bulan.month_month_id LEFT JOIN account ON account.account_id=detail_payment_rate_bulan.payment_rate_via WHERE payment_rate_status=1 AND payment_rate.student_student_id=? order by month_id",
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
  getKasMonthlyPaymentAllStudent: (
    isPrev = false,
    accountId,
    tanggal_awal,
    tanggal_akhir,
    periodId,
    unitId
  ) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT 
        detail_payment_rate_bulan.*,
        student.*,
        class.class_name,
        period.*,
        accountBayar.account_description AS account_cost_account_description,
        accountBayar.account_code AS account_cost_account_code,
        accountBiaya.*,
        detail_payment_rate_bulan.payment_rate_bill AS total,
        month.month_name 
    FROM 
        detail_payment_rate_bulan
        INNER JOIN payment_rate ON payment_rate.payment_rate_id = detail_payment_rate_bulan.payment_rate_id
        INNER JOIN month ON month.month_id = detail_payment_rate_bulan.month_month_id
        INNER JOIN payment ON payment.payment_id = payment_rate.payment_payment_id
        INNER JOIN period ON period.period_id = payment.period_period_id
        INNER JOIN student ON student.student_id = payment_rate.student_student_id
        INNER JOIN class ON student.class_class_id = class.class_id
        INNER JOIN pos_pay ON payment.pos_pos_id = pos_pay.pos_pay_id
        INNER JOIN account accountBiaya ON pos_pay.account_account_code = accountBiaya.account_code
        LEFT JOIN account accountBayar ON accountBayar.account_id = detail_payment_rate_bulan.payment_rate_via
    WHERE 
        payment_rate_status = 1 
        ${
          accountId != ""
            ? `AND accountBayar.account_code = '${accountId}' `
            : ""
        }
        AND detail_payment_rate_bulan.payment_rate_date_pay ${
          isPrev
            ? `< '${tanggal_awal}'`
            : `BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}'`
        }  
       ${periodId && ` AND payment.period_period_id = ${periodId} `}
        ${unitId && `AND payment.unit_unit_id = ${unitId}`} 
   `,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getTagihanMonthlyPaymentByStudent: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT detail_payment_rate_bulan.*,account.account_description as payment_rate_via_name,month.month_name FROM detail_payment_rate_bulan INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id INNER JOIN month on month.month_id=detail_payment_rate_bulan.month_month_id LEFT JOIN account ON account.account_id=detail_payment_rate_bulan.payment_rate_via WHERE payment_rate_status=0 AND payment_rate.student_student_id=? order by month_id",
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
  getTagihanMonthlyPaymentAllStudentByPaymentQuery: (
    unitId,
    classId,
    periodId,
    payment_type
  ) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bulan.*,unit.unit_name,student.*, payment.payment_id, class.class_name,SUM(payment_rate_bill) as total_tagihan FROM  payment_rate INNER JOIN student ON payment_rate.student_student_id=student.student_id INNER JOIN detail_payment_rate_bulan  ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id LEFT JOIN unit on unit.unit_id=student.unit_unit_id LEFT JOIN class on class.class_id=student.class_class_id LEFT JOIN payment on payment.payment_id=payment_rate.payment_payment_id LEFT JOIN period ON period.period_id=payment.period_period_id WHERE student.unit_unit_id=${unitId} ${
          classId != "" ? `and class.class_id=${classId}` : ""
        } ${
          periodId != "" && ` AND period.period_id=${periodId}`
        } AND payment.payment_id=${payment_type} GROUP BY detail_payment_rate_bulan.detail_payment_rate_id`,
        [unitId, periodId, payment_type],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getTagihanMonthlyPaymentAllStudentByPos: (
    unitId,
    classId,
    periodId,
    payment_type
  ) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bulan.*,unit.unit_name,student.*, payment.*, class.class_name FROM  payment_rate INNER JOIN student ON payment_rate.student_student_id=student.student_id INNER JOIN detail_payment_rate_bulan  ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id LEFT JOIN unit on unit.unit_id=student.unit_unit_id LEFT JOIN class on class.class_id=student.class_class_id LEFT JOIN payment on payment.payment_id=payment_rate.payment_payment_id LEFT JOIN period ON period.period_id=payment.period_period_id LEFT JOIN pos_pay ON pos_pay.pos_pay_id=payment.pos_pos_id WHERE student.unit_unit_id=${unitId} ${
          classId != "" ? `and class.class_id=${classId}` : ""
        } AND period.period_id=${periodId} AND payment.pos_pos_id=${payment_type} GROUP BY detail_payment_rate_bulan.detail_payment_rate_id`,
        [unitId, periodId, payment_type],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getTagihanMonthlyPaymentAllStudentByPosWithDate: (
    unitId,
    classId,
    periodId,
    date_awal,
    date_akhir
  ) =>
    new Promise((resolve, reject) => {
      console.log(classId == "");
      connection.query(
        `SELECT detail_payment_rate_bulan.*,unit.unit_name,student.*, payment.payment_id, pos_pay.pos_pay_name,pos_pay.pos_pay_description, class.class_name,month.month_name FROM  payment_rate INNER JOIN student ON payment_rate.student_student_id=student.student_id INNER JOIN detail_payment_rate_bulan  ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id LEFT JOIN unit on unit.unit_id=student.unit_unit_id LEFT JOIN class on class.class_id=student.class_class_id LEFT JOIN payment on payment.payment_id=payment_rate.payment_payment_id LEFT JOIN period ON period.period_id=payment.period_period_id LEFT JOIN pos_pay ON pos_pay.pos_pay_id=payment.pos_pos_id INNER JOIN month on detail_payment_rate_bulan.month_month_id=month.month_id WHERE student.unit_unit_id=${unitId} ${
          classId != "" ? `and class.class_id=${classId}` : ""
        } AND period.period_id=${periodId} AND is_submit_payment=1 AND DATE(detail_payment_rate_bulan.payment_rate_date_pay) BETWEEN '${date_awal}' AND '${date_akhir}' GROUP BY detail_payment_rate_bulan.detail_payment_rate_id`,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getTagihanMonthlyPaymentAllStudent: (unitId, classId, periodId) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bulan.*,unit.unit_name,student.*, class.class_name FROM detail_payment_rate_bulan LEFT JOIN  payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id LEFT JOIN student ON student.student_id=payment_rate.student_student_id LEFT JOIN unit on unit.unit_id=student.unit_unit_id LEFT JOIN class on class.class_id=student.class_class_id LEFT JOIN payment on payment.payment_id=payment_rate.payment_payment_id LEFT JOIN period ON period.period_id=payment.period_period_id WHERE payment_rate_status=0 AND student.unit_unit_id=? and class.class_id=? ${periodId &&`AND period.period_id=${periodId}`} `,
        [unitId, classId],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getTagihanMonthlyPaymentAllStudentWithDate: (
    unitId,
    classId,
    periodId,
    tanggal_awal,
    tanggal_akhir
  ) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bulan.*,unit.unit_name,student.*,payment_rate.*, class.class_name FROM student LEFT JOIN payment_rate ON payment_rate.student_student_id=student.student_id LEFT JOIN detail_payment_rate_bulan  ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id LEFT JOIN unit on unit.unit_id=student.unit_unit_id LEFT JOIN class on class.class_id=student.class_class_id LEFT JOIN payment on payment.payment_id=payment_rate.payment_payment_id LEFT JOIN period ON period.period_id=payment.period_period_id WHERE payment_rate_status=0 AND student.unit_unit_id=? and class.class_id=? AND period.period_id=? AND DATE(detail_payment_rate_bulan.created_at) BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}' `,
        [unitId, classId, periodId],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getAllMonthlyPaymentAllStudent: (unitId, classId, periodId) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bulan.*,payment_rate.payment_rate_id,payment.*,payment_rate.student_student_id,unit.unit_name,student.*, class.class_name,month.* FROM student LEFT JOIN payment_rate ON payment_rate.student_student_id=student.student_id INNER JOIN detail_payment_rate_bulan  ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id LEFT JOIN unit on unit.unit_id=student.unit_unit_id LEFT JOIN class on class.class_id=student.class_class_id LEFT JOIN payment on payment.payment_id=payment_rate.payment_payment_id LEFT JOIN period ON period.period_id=payment.period_period_id LEFT JOIN month on detail_payment_rate_bulan.month_month_id=month.month_id WHERE student.unit_unit_id=? and class.class_id=? AND period.period_id=? `,
        [unitId, classId, periodId],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getMonthlyPaymentTypeByStudent: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM view_payment_type WHERE student_student_id=? AND payment_type='BULANAN'",
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
  getMonthlyPaymentTypeAllStudentByPaymentQuery: (ids) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM view_payment_type WHERE student_student_id IN(${ids}) AND payment_type='BULANAN'`,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getMonthlyPaymentTransactionNumber: (id, date) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT DISTINCT detail_payment_rate_bulan.payment_rate_number_pay from detail_payment_rate_bulan INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bulan.payment_rate_id where detail_payment_rate_bulan.payment_rate_number_pay IS NOT NULL AND payment_rate.student_student_id=${id} AND payment_rate_date_pay='${date}'`,
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

  putMonthlyPayment: (id, setData) =>
    new Promise((resolve, reject) => {
      connection.query(
        "UPDATE detail_payment_rate_bulan set ? WHERE detail_payment_rate_id=?",
        [setData, id],
        (error, result) => {
          if (!error) {
            const newData = {
              detail_payment_rate_id: parseInt(id, 10),
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
  putMonthlyPaymentById: (setData, id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "UPDATE detail_payment_rate_bulan set ? WHERE detail_payment_rate_id=?",
        [setData, id],
        (error, result) => {
          if (!error) {
            const newData = {
              detail_payment_rate_id: parseInt(id, 10),
              ...result,
              field: { id: parseInt(id, 10) },
            };
            resolve(newData);
          } else {
            reject(error);
          }
        }
      );
    }),
  putAllMonthlyPaymentById: (setData, id) =>
    new Promise((resolve, reject) => {
      connection.query(
        `UPDATE detail_payment_rate_bulan set ? WHERE detail_payment_rate_id IN (${id})`,
        [setData],
        (error, result) => {
          if (!error) {
            const newData = {
              detail_payment_rate_id: parseInt(id, 10),
              ...result,
              field: { id: parseInt(id, 10) },
            };
            resolve(newData);
          } else {
            reject(error);
          }
        }
      );
    }),
};
