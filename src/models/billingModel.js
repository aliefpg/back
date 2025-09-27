const moment = require("moment");
const db = require("../config/db.config.js");

function getLastNMonths(n) {
  const months = [];
  for (let i = 0; i < n; i++) {
    const date = moment().subtract(i, "months");
    months.push({
      month_id: date.month() + 1,
      month_name: date.format("MMMM"),
      year: date.year(),
    });
  }
  return months.reverse();
}

/**
 * Mengambil riwayat tagihan lengkap (bulanan & bebas) untuk satu siswa
 * dalam rentang waktu tertentu yang dihitung mundur dari akhir sebuah periode.
 * @param {string} studentId - ID Siswa
 * @param {string} periodId - ID Periode (Tahun Ajaran) sebagai acuan akhir waktu
 * @param {number} historyRange - Jangka waktu dalam bulan untuk ditarik ke belakang
 * @returns {Promise<Array>} Array data riwayat tagihan
 */
async function getFullBillingHistory(studentId, periodId, historyRange = 12) {
  // Ambil data periode untuk menentukan tanggal akhir
  const [periodData] = await db.promise().query(
    "SELECT period_start, period_end FROM period WHERE period_id = ?",
    [periodId]
  );

  if (periodData.length === 0) {
    console.error(`Periode dengan ID: ${periodId} tidak ditemukan.`);
    return [];
  }

  const periodEndDate = moment(`${periodData[0].period_end}-06-30`);
  const historyStartDate = periodEndDate.clone().subtract(historyRange - 1, "months").startOf("month");
  const startDateString = historyStartDate.format("YYYYMM");
  const endDateString = periodEndDate.format("YYYYMM");

  const [rows] = await db.promise().query(
    `
    SELECT * FROM (
    -- Tagihan Bulanan
    SELECT
        s.student_id,
        s.student_full_name,
        s.student_nis,
        CONCAT(m.month_name, ' ', p.period_start, '/', p.period_end) AS tanggal,
        CONCAT(CASE WHEN m.calendar_order >= 7 THEN p.period_start ELSE p.period_end END, LPAD(m.calendar_order, 2, '0')) AS sort_date,
        dpr.payment_rate_number_pay AS no_ref,
        vpt.pos_pay_name AS nama_pembayaran,
        CAST(dpr.payment_rate_bill AS DECIMAL(15, 0)) AS nominal,
        NULL AS sisa_tagihan,
        '❌ Belum Lunas' AS status
    FROM student s
    JOIN payment_rate pr ON pr.student_student_id = s.student_id
    JOIN payment pay ON pay.payment_id = pr.payment_payment_id
    JOIN period p ON p.period_id = pay.period_period_id
    JOIN detail_payment_rate_bulan dpr ON dpr.payment_rate_id = pr.payment_rate_id
    JOIN month m ON m.month_id = dpr.month_month_id
    JOIN view_payment_type vpt ON vpt.payment_rate_id = pr.payment_rate_id
    WHERE s.student_id = ? 
      AND CONCAT(CASE WHEN m.calendar_order >= 7 THEN p.period_start ELSE p.period_end END, LPAD(m.calendar_order, 2, '0')) BETWEEN ? AND ?
      AND (dpr.payment_rate_number_pay IS NULL OR dpr.payment_rate_number_pay = '')

    UNION ALL

    -- Tagihan Bebas
    SELECT
        s.student_id,
        s.student_full_name,
        s.student_nis,
        CONCAT('Bebas ', p.period_start) AS tanggal,
        CONCAT(p.period_start, '00') AS sort_date,
        NULL AS no_ref,
        vpt.pos_pay_name AS nama_pembayaran,
        CAST(drb.payment_rate_bill AS DECIMAL(15, 0)) AS nominal,
        drb.payment_rate_bill - COALESCE(SUM(drbp.payment_rate_bebas_pay_bill), 0) AS sisa_tagihan,
        '❌ Belum Lunas' AS status
    FROM student s
    JOIN payment_rate pr ON pr.student_student_id = s.student_id
    JOIN payment pay ON pay.payment_id = pr.payment_payment_id
    JOIN period p ON p.period_id = pay.period_period_id
    JOIN detail_payment_rate_bebas drb ON drb.payment_rate_id = pr.payment_rate_id
    LEFT JOIN detail_payment_rate_bebas_pay drbp ON drbp.detail_payment_rate_id = drb.detail_payment_rate_id
    JOIN view_payment_type vpt ON vpt.payment_rate_id = pr.payment_rate_id
    WHERE s.student_id = ?
      AND drb.payment_rate_status = 0
    GROUP BY drb.detail_payment_rate_id
) AS all_payments
ORDER BY all_payments.sort_date ASC;

    `,
    [studentId, startDateString, endDateString, studentId]
  );

  return rows;
}
// Fungsi ini tidak berubah
async function getTotalTagihanByStudentId(studentId) {
  const [rowsBulan] = await db.promise().query(
    `SELECT SUM(payment_rate_bill) as total FROM detail_payment_rate_bulan dpr
     JOIN payment_rate pr ON dpr.payment_rate_id = pr.payment_rate_id
     WHERE pr.student_student_id = ? AND dpr.payment_rate_status = 0`,
    [studentId]
  );

  const [rowsBebas] = await db.promise().query(
    `SELECT SUM(payment_rate_bebas_pay_bill) as total FROM detail_payment_rate_bebas_pay dbp
     JOIN payment_rate pr ON dbp.payment_rate_id = pr.payment_rate_id
     WHERE pr.student_student_id = ? AND dbp.payment_rate_bebas_pay_status = 0`,
    [studentId]
  );

  const totalBulan = rowsBulan[0]?.total || 0;
  const totalBebas = rowsBebas[0]?.total || 0;

  return parseInt(totalBulan, 10) + parseInt(totalBebas, 10);
}

module.exports = {
  getLastNMonths,
  getFullBillingHistory,
  getTotalTagihanByStudentId,
};
