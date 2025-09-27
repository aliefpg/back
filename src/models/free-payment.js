const connection = require("../config/db.config");

module.exports = {
  getFreePaymentByStudent: (id, period_start = "", period_end = "") =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bebas.*,view_payment.* FROM detail_payment_rate_bebas INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bebas.payment_rate_id INNER JOIN view_payment ON view_payment.payment_id=payment_rate.payment_payment_id  WHERE payment_rate.student_student_id=? AND period_start LIKE '%${period_start}%' AND period_end LIKE '%${period_end}%'`,
        id,
        (error, result) => {
          if (!error) {
            resolve(
              result.map((item) => ({
                ...item,
                payment_rate_discount: parseInt(item.payment_rate_discount, 10),
                payment_rate_total_pay: parseInt(
                  item.payment_rate_total_pay,
                  10
                ),
              }))
            );
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getFreePaymentTypeByStudent: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM view_payment_type WHERE student_student_id=? AND payment_type='BEBAS'",
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
  getDetailFreePaymentTypeByIdPayment: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM detail_payment_rate_bebas_pay WHERE detail_payment_rate_id =?",
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
  getDetailFreePaymentTypeByReference: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT detail_payment_rate_bebas_pay.*,detail_payment_rate_bebas.*,view_payment.*,account.account_description as payment_rate_via_name FROM detail_payment_rate_bebas_pay LEFT JOIN account ON account.account_id=detail_payment_rate_bebas_pay.payment_rate_via INNER JOIN detail_payment_rate_bebas ON detail_payment_rate_bebas.detail_payment_rate_id=detail_payment_rate_bebas_pay.detail_payment_rate_id INNER JOIN payment_rate on payment_rate.payment_rate_id=detail_payment_rate_bebas.payment_rate_id INNER JOIN view_payment ON view_payment.payment_id=payment_rate.payment_payment_id WHERE payment_rate_bebas_pay_number =?",
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
  getAllDetailFreePaymentTypeByIdPayment: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bebas_pay.*, SUM(detail_payment_rate_bebas_pay.payment_rate_bebas_pay_bill) as 'total_bayar' FROM detail_payment_rate_bebas_pay WHERE detail_payment_rate_id IN (${id}) group BY detail_payment_rate_id `,

        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),

  getHistoryFreePaymentIdPayment: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT detail_payment_rate_bebas.*,detail_payment_rate_bebas_pay.* FROM detail_payment_rate_bebas INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bebas.payment_rate_id INNER JOIN detail_payment_rate_bebas_pay ON detail_payment_rate_bebas_pay.detail_payment_rate_id=detail_payment_rate_bebas.detail_payment_rate_id WHERE payment_rate.student_student_id=? ",
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
  getKasFreePaymentIdPayment: (
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
        detail_payment_rate_bebas.*,
        student.*,
        accountBiaya.*,
        period.*,
        accountBayar.account_code AS account_cost_account_code,
        accountBayar.account_description AS account_cost_account_description,
        class.class_name,
        detail_payment_rate_bebas_pay.*,
        payment_rate_bebas_pay_bill AS total
    FROM 
        detail_payment_rate_bebas
        INNER JOIN payment_rate ON payment_rate.payment_rate_id = detail_payment_rate_bebas.payment_rate_id
        INNER JOIN detail_payment_rate_bebas_pay ON detail_payment_rate_bebas_pay.detail_payment_rate_id = detail_payment_rate_bebas.detail_payment_rate_id
        INNER JOIN payment ON payment.payment_id = payment_rate.payment_payment_id
        INNER JOIN period ON payment.period_period_id = period.period_id
        INNER JOIN account accountBayar ON accountBayar.account_id = detail_payment_rate_bebas_pay.payment_rate_via
        INNER JOIN pos_pay ON payment.pos_pos_id = pos_pay.pos_pay_id
        INNER JOIN student ON student.student_id = payment_rate.student_student_id
        INNER JOIN class ON student.class_class_id = class.class_id
        INNER JOIN account accountBiaya ON pos_pay.account_account_code = accountBiaya.account_code
    WHERE 
        ${
          accountId != ""
            ? `accountBayar.account_code = '${accountId}' AND `
            : " "
        }
         detail_payment_rate_bebas_pay.payment_rate_date_pay ${
           isPrev
             ? `< '${tanggal_awal}'`
             : ` BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}'`
         }
        ${periodId && ` AND payment.period_period_id = ${periodId} `}
        ${unitId ? `AND payment.unit_unit_id = ${unitId}` : ""} 
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
  getTagihanFreeAllStudent: (unitId, classId, periodId) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT detail_payment_rate_bebas.*,student.* FROM detail_payment_rate_bebas INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bebas.payment_rate_id INNER JOIN payment ON payment.payment_id=payment_rate.payment_payment_id INNER JOIN student ON student.student_id=payment_rate.student_student_id WHERE student.unit_unit_id=? AND student.class_class_id=? AND payment.period_period_id=?",
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
  getFreePaymentById: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM detail_payment_rate_bebas WHERE detail_payment_rate_id =?",
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
  getTagihanFreePaymentAllStudent: (unitId, classId, periodId) =>
    new Promise((resolve, reject) => {
      console.log(classId, "ss");
      connection.query(
        `SELECT detail_payment_rate_bebas_pay.*,unit.unit_name, student.*, class.class_name FROM detail_payment_rate_bebas_pay LEFT JOIN detail_payment_rate_bebas ON detail_payment_rate_bebas.detail_payment_rate_id=detail_payment_rate_bebas_pay.detail_payment_rate_id LEFT JOIN payment_rate ON detail_payment_rate_bebas.payment_rate_id=payment_rate.payment_rate_id LEFT JOIN payment on payment.payment_id=payment_rate.payment_payment_id LEFT JOIN student ON student.student_id=payment_rate.student_student_id LEFT JOIN class on class.class_id=student.class_class_id   LEFT JOIN unit ON unit.unit_id = student.unit_unit_id  LEFT JOIN period ON period.period_id=payment.period_period_id WHERE payment_rate_status=0 AND student.unit_unit_id=? ${
          classId !== "" ? `and class.class_id=${classId}` : ""
        } ${
          periodId && `AND period.period_id=${periodId}`
        } ORDER BY payment_rate_bebas_pay_created_at DESC `,
        [unitId],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getTagihanFreeAllStudentWithDate: (
    unitId,
    classId,
    periodId,
    tanggal_awal,
    tanggal_akhir
  ) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bebas.*,student.* ,payment.* FROM detail_payment_rate_bebas INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bebas.payment_rate_id INNER JOIN payment ON payment.payment_id=payment_rate.payment_payment_id INNER JOIN student ON student.student_id=payment_rate.student_student_id WHERE student.unit_unit_id=? AND payment_rate_status=0 AND student.class_class_id=? AND payment.period_period_id=? AND DATE(detail_payment_rate_bebas.created_at) BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}'`,
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
  getTagihanFreePaymentAllStudentWithDate: (
    unitId,
    classId,
    periodId,
    tanggal_awal,
    tanggal_akhir
  ) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bebas_pay.*,unit.unit_name, student.*,payment_rate.*, class.class_name FROM detail_payment_rate_bebas_pay LEFT JOIN detail_payment_rate_bebas ON detail_payment_rate_bebas.detail_payment_rate_id=detail_payment_rate_bebas_pay.detail_payment_rate_id LEFT JOIN payment_rate ON detail_payment_rate_bebas.payment_rate_id=payment_rate.payment_rate_id LEFT JOIN payment on payment.payment_id=payment_rate.payment_payment_id LEFT JOIN student ON student.student_id=payment_rate.student_student_id LEFT JOIN class on class.class_id=student.class_class_id   LEFT JOIN unit ON unit.unit_id = student.unit_unit_id  LEFT JOIN period ON period.period_id=payment.period_period_id WHERE payment_rate_status=0 AND student.unit_unit_id=? ${
          classId !== "" ? `and class.class_id=${classId}` : ""
        } AND period.period_id=? AND DATE(payment_rate_bebas_pay_created_at) BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}' ORDER BY payment_rate_bebas_pay_created_at DESC `,
        [unitId, periodId],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getAllFreePaymentAllStudent: (
    unitId,
    classId,
    periodId,
    tanggal_awal,
    tanggal_akhir
  ) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bebas_pay.*,detail_payment_rate_bebas.payment_rate_id,payment.*,payment_rate.student_student_id,unit.unit_name, student.*, class.class_name FROM detail_payment_rate_bebas_pay LEFT JOIN detail_payment_rate_bebas ON detail_payment_rate_bebas.detail_payment_rate_id=detail_payment_rate_bebas_pay.detail_payment_rate_id LEFT JOIN payment_rate ON detail_payment_rate_bebas.payment_rate_id=payment_rate.payment_rate_id LEFT JOIN payment on payment.payment_id=payment_rate.payment_payment_id LEFT JOIN student ON student.student_id=payment_rate.student_student_id LEFT JOIN class on class.class_id=student.class_class_id   LEFT JOIN unit ON unit.unit_id = student.unit_unit_id  LEFT JOIN period ON period.period_id=payment.period_period_id WHERE payment_rate_status=0 AND student.unit_unit_id=? ${
          classId !== "" ? `and class.class_id=${classId}` : ""
        } AND period.period_id=? ORDER BY payment_rate_bebas_pay_created_at DESC `,
        [unitId, periodId],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getTagihanFreePaymentAllStudentByPos: (unitId, classId, periodId, posId) =>
    new Promise((resolve, reject) => {
      console.log(posId);
      connection.query(
        `SELECT detail_payment_rate_bebas_pay.*,unit.unit_name, student.*, class.class_name,detail_payment_rate_bebas.payment_rate_bill FROM student LEFT JOIN unit ON unit.unit_id = student.unit_unit_id LEFT JOIN payment_rate ON payment_rate.student_student_id=student.student_id LEFT JOIN detail_payment_rate_bebas ON payment_rate.payment_rate_id=detail_payment_rate_bebas.payment_rate_id INNER JOIN detail_payment_rate_bebas_pay ON detail_payment_rate_bebas.detail_payment_rate_id=detail_payment_rate_bebas_pay.detail_payment_rate_id LEFT JOIN class on class.class_id=student.class_class_id LEFT JOIN payment on payment.payment_id=payment_rate.payment_payment_id LEFT JOIN period ON period.period_id=payment.period_period_id WHERE payment_rate_status=0 AND student.unit_unit_id=? ${
          classId !== "" ? `and class.class_id=${classId}` : ""
        } ${
          periodId != "" && ` AND period.period_id=${periodId}`
        } AND payment.pos_pos_id=${posId} GROUP BY detail_payment_rate_bebas_pay.payment_rate_bebas_pay_id ORDER BY detail_payment_rate_bebas_pay.payment_rate_bebas_pay_created_at DESC `,
        [unitId],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getTagihanFreePaymentAllStudentByPosWithDate: (
    unitId,
    classId,
    periodId,
    tanggal_awal,
    tanggal_akhir
  ) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT detail_payment_rate_bebas_pay.*,unit.unit_name, payment.payment_id, student.*, class.class_name,detail_payment_rate_bebas.payment_rate_bill FROM student LEFT JOIN unit ON unit.unit_id = student.unit_unit_id LEFT JOIN payment_rate ON payment_rate.student_student_id=student.student_id LEFT JOIN detail_payment_rate_bebas ON payment_rate.payment_rate_id=detail_payment_rate_bebas.payment_rate_id INNER JOIN detail_payment_rate_bebas_pay ON detail_payment_rate_bebas.detail_payment_rate_id=detail_payment_rate_bebas_pay.detail_payment_rate_id LEFT JOIN class on class.class_id=student.class_class_id LEFT JOIN payment on payment.payment_id=payment_rate.payment_payment_id LEFT JOIN period ON period.period_id=payment.period_period_id WHERE student.unit_unit_id=${unitId} ${
          classId !== "" ? `and class.class_id=${classId}` : ""
        } AND period.period_id=${periodId} AND is_submit_payment=1 AND DATE(detail_payment_rate_bebas_pay.payment_rate_bebas_pay_created_at) BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}'`,
        [unitId, periodId],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getFreePaymentTransactionNumber: (id, date) =>
    new Promise((resolve, reject) => {
      connection.query(
        `select DISTINCT detail_payment_rate_bebas_pay.payment_rate_bebas_pay_number from detail_payment_rate_bebas_pay INNER JOIN detail_payment_rate_bebas ON detail_payment_rate_bebas.detail_payment_rate_id=detail_payment_rate_bebas_pay.detail_payment_rate_id INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bebas.payment_rate_id where detail_payment_rate_bebas_pay.payment_rate_bebas_pay_number IS NOT NULL AND payment_rate.student_student_id=${id} AND DATE (payment_rate_bebas_pay_created_at)='${date}'`,
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
  getFreePaymentTypeByStudent: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM view_payment_type WHERE student_student_id=? AND payment_type='BEBAS'",
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
  getFreePaymentTypeAllStudentByPaymentQuery: (ids) =>
    new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM view_payment_type WHERE payment_rate_id IN(${ids}) AND payment_type='BEBAS'`,
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
  getTagihanFreePaymentIdPayment: (id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT detail_payment_rate_bebas.* FROM detail_payment_rate_bebas INNER JOIN payment_rate ON payment_rate.payment_rate_id=detail_payment_rate_bebas.payment_rate_id WHERE payment_rate.student_student_id=? and payment_rate_status=0 ",
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
  putDiscountFreePaymentById: (setData, id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "UPDATE detail_payment_rate_bebas set ? WHERE detail_payment_rate_id=?",
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

  putPaymentFreePayment: (setData, id) =>
    new Promise((resolve, reject) => {
      connection.query(
        "UPDATE detail_payment_rate_bebas set ? WHERE detail_payment_rate_id=?",
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
  postDetailFreePayment: (setData) =>
    new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO detail_payment_rate_bebas_pay set ? ",
        [setData],
        (error, result) => {
          if (!error) {
            const newData = {
              detail_payment_rate_id: parseInt(result.insertId, 10),
              ...result,
              field: { id: parseInt(result.insertId, 10) },
            };
            resolve(newData);
          } else {
            reject(error);
          }
        }
      );
    }),
};
