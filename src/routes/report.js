const express = require("express");

const Route = express.Router();
const reportController = require("../controllers/report");
const { authentication } = require("../middleware/authMiddleware");

Route
  .get(
    "/pembayaran-per-kelas",
    authentication,
    reportController.laporanPembayaranPerKelas
  )
  .get(
    "/pembayaran-per-tanggal",
    authentication,
    reportController.laporanPembayaranPerTanggal
  )
  .get(
    "/tagihan-siswa",
    authentication,
    reportController.laporanTagihanSiswa
  )
  .get(
    "/rekap-pembayaran",
    // authentication,
    reportController.laporanRekapPembayaran
  )
  .get(
    "/kas-bank",
    authentication,
    reportController.laporanKasBank
  )
  .get(
    "/kas-tunai",
    authentication,
    reportController.laporanKasTunai
  )
  .get(
    "/jurnal-umum",
    authentication,
    reportController.laporanJurnalUmum
  );
module.exports = Route;
