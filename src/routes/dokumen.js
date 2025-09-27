const express = require("express");

const Route = express.Router();
const dokumenController = require("../controllers/dokumen");
const { authentication } = require("../middleware/authMiddleware");

Route.get(
  "/tagihan-pembayaran/:id",
  dokumenController.getDokumenTagihanPembayaran
)
  .get("/rincian-pembayaran/:id", dokumenController.getDokumenRincianPembayaran)
  .get("/kredit/:id", authentication, dokumenController.getDokumenKredit)
  .get("/debit/:id", authentication, dokumenController.getDokumenDebit)
  .post("/kwitansi-pembayaran", dokumenController.getKwitansiPembayaran)
  .get(
    "/public/tagihan-pembayaran",

    dokumenController.getPublicDokumenTagihanPembayaran
  )
  .get(
    "/public/bukti-pembayaran",

    dokumenController.getPublicDokumenBuktiPembayaran
  )
  .get(
    "/report/pembayaran-per-kelas",

    dokumenController.dokumenlaporanPembayaranPerKelas
  )
  .get(
    "/report/excel/pembayaran-per-kelas",
    authentication,
    dokumenController.dokumenlaporanExcelPembayaranPerKelas
  )
  .get(
    "/report/pembayaran-per-tanggal",
    authentication,
    dokumenController.dokumenlaporanPembayaranPerTanggal
  )
  .get(
    "/report/excel/pembayaran-per-tanggal",
    authentication,
    dokumenController.dokumenlaporanExcelPembayaranPerTanggal
  )
  .get(
    "/report/laporan-kas-bank",
    authentication,
    dokumenController.dokumenLaporanKasBank
  )
  .get(
    "/report/excel/laporan-kas-bank",
    authentication,
    dokumenController.dokumenLaporanExcelKasBank
  )
  .get(
    "/report/laporan-kas-tunai",
    authentication,
    dokumenController.dokumenLaporanKasTunai
  )
  .get(
    "/report/excel/laporan-kas-tunai",
    authentication,
    dokumenController.dokumenLaporanExcelKasTunai
  )
  .get(
    "/report/laporan-jurnal-umum",
    authentication,
    dokumenController.dokumenLaporanJurnalUmum
  )
  .get(
    "/report/excel/laporan-jurnal-umum",
    authentication,
    dokumenController.dokumenLaporanExcelJurnalUmum
  )
  .get(
    "/report/laporan-kas-bank/anggaran",
    authentication,
    dokumenController.dokumenLaporanKasBankPerAnggaran
  )
  .get(
    "/report/laporan-kas-tunai/anggaran",
    authentication,
    dokumenController.dokumenLaporanKasTunaiPerAnggaran
  )
  .get(
    "/report/laporan-kas-bank/anggaran",
    authentication,
    dokumenController.dokumenLaporanKasBankPerAnggaran
  )
  .get(
    "/report/excel/rekap-pembayaran",
    authentication,
    dokumenController.laporanExcelRekapPembayaran
  )
  .get(
    "/report/laporan-jurnal-umum/anggaran",
    authentication,
    dokumenController.dokumenLaporanJurnalPerAnggaran
  );

module.exports = Route;
