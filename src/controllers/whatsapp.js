const axios = require("axios");
const helpers = require("../helpers");
const { promiseHandler } = require("../middleware/promiseHandler");
const { encryptData } = require("../utils/encrypt");
const waConfigModel = require("../models/waConfigModel");
const billingModel = require("../models/billingModel");

require("dotenv").config();

// === Spintax parser ===
function parseSpintax(str) {
  return str.replace(/\{([^{}]+)\}/g, (_, group) => {
    const options = group.split("|");
    return options[Math.floor(Math.random() * options.length)];
  });
}

// Format nomor WA konsisten (62xxxx)
function formatPhoneForWA(number) {
  if (!number) return "";
  if (number.startsWith("0")) return `62${number.slice(1)}`;
  return number.replace(/^\+/, "");
}

module.exports = {
  postMessage: promiseHandler(async (req, res) => {
    const { students, period_id } = req.body;

    try {
      // Ambil konfigurasi WA
      const configs = await waConfigModel.getAll();
      const configTagihan = configs.find((c) => c.notification_type === "KIRIM_TAGIHAN");
      const configRange = configs.find((c) => c.notification_type === "KIRIM_TAGIHAN_HISTORY_RANGE");

      if (!configTagihan || !configTagihan.is_active) {
        return helpers.response(res, 400, "Fitur notifikasi tagihan sedang tidak aktif.", {});
      }

      const historyRange = configRange && !isNaN(parseInt(configRange.value, 10)) ? parseInt(configRange.value, 10) : 12;
      const templatePesan = configTagihan.template_message;

      const results = [];

      for (const student of students) {
        try {
          // Enkripsi link detail
          const encData = encryptData(student.student_id.toString());
          const detailLink = `${process.env.REACT_URL}/tagihan?iv=${encData.iv}&encryptedData=${encData.encryptedData}`;

          // Ambil riwayat tagihan
          const billingHistory = await billingModel.getFullBillingHistory(student.student_id, period_id, historyRange);

          // Format riwayat tagihan
          const riwayatText = billingHistory
            .filter((row) => row.status === "❌ Belum Lunas")
            .map((row, i) => `${i + 1}. ${row.tanggal}: ${row.status}\n   ${row.nama_pembayaran} - ${helpers.rupiahConvert(row.sisa_tagihan ?? row.nominal ?? 0)}`)
            .join("\n\n");

          const riwayatFinal = riwayatText.length ? riwayatText : "- Tidak ada tagihan terutang pada periode ini -";

          const totalRiwayat = billingHistory
            .filter((row) => row.status === "❌ Belum Lunas")
            .reduce((sum, row) => sum + (Number(row.sisa_tagihan ?? row.nominal ?? 0)), 0);

          const tagihanFormatted = helpers.rupiahConvert(totalRiwayat);

          // Buat pesan final & spintax
          let pesanFinal = templatePesan
            .replace(/{{nama_siswa}}/g, student.student_full_name)
            .replace(/{{nis}}/g, student.student_nis)
            .replace(/{{kelas}}/g, student.class_class_name || "")
            .replace(/{{link_detail}}/g, detailLink)
            .replace(/{{total_tagihan}}/g, totalRiwayat)
            .replace(/{{tagihan_rupiah}}/g, tagihanFormatted)
            .replace(/{{riwayat_tagihan}}/g, riwayatFinal);

          pesanFinal = parseSpintax(pesanFinal);

          // Format nomor WA
          const phoneNumber = formatPhoneForWA(student.student_parent_phone);
          if (!phoneNumber) {
            results.push({
              phone: null, student: student.student_full_name, status: false, message: "Nomor WA tidak tersedia"
            });
            continue;
          }

          // Kirim WA
          await axios.post(process.env.WABLAS_URL, {
            phone: phoneNumber,
            message: pesanFinal
          }, {
            headers: {
              Authorization: `${process.env.WABLAS_TOKEN}.${process.env.WABLAS_SECRET_KEY}`,
              "Content-Type": "application/json"
            },
            timeout: 15000
          });
        } catch (err) {
          results.push({
            phone: null, student: student.student_full_name, status: false, message: err.message
          });
          continue;
        }
      }

      return helpers.response(res, 200, "Proses pengiriman selesai.", { results });
    } catch (error) {
      return helpers.response(res, 500, "Terjadi kesalahan internal saat memproses permintaan.", error);
    }
  }),
};
