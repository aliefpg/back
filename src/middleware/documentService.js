const puppeteer = require("puppeteer");

const path = require("path");
const fs = require("fs");
const moment = require("moment");
const { dateConvert, rupiahConvert, terbilang_rupiah } = require("../helpers");
const {
  tableHtmlRincianPembayaran,
  tableTagihanPembayaran,
  tableKwitansiPembayaran,
  tableKasKredit,
  tableKasDebit,
  tableLaporanPerKelas,
  headerTableLaporanPerTanggal,
  tableLaporanPerTanggal,
  footerTableLaporanPerTanggal,
  tableLaporanKas,
  tableLaporanJurnalUmum,
  tableLaporanKasPerAnggaran,
  tableLaporanJurnalPerAnggaran,
} = require("../assets/htmlTemplate");

module.exports = {
  async pdfGenerate(htmlFile, opts = {}) {
    let browser;
    try {
      const {
        margin = {
          top: "0.4in",
          right: "0.4in",
          bottom: "0.4in",
          left: "0.4in",
        },
        format = "Letter",
      } = opts;
      // CREATE PDF USING PUPETEER
      browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        timeout: 60000,
      });
      const page = await browser.newPage();
      await page.setContent(htmlFile, { waitUntil: "domcontentloaded" });
      //   page = page.replace(/NAMA_BORROWER/g, borrower.nama_borrower);

      //   await page.emulateMedia("screen");
      const buffer = await page.pdf({
        printBackground: true,
        margin,
        format,
        preferCSSPageSize: true,
      });
      await browser.close();
      return buffer;
    } catch (err) {
      console.error("Error generating PDF:", err);
      throw new Error("PDF generation failed");
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },

  async generateRincianPembayaran(htmlFileUrl, datas) {
    console.log(datas);
    // baca file
    let html = fs.readFileSync(path.join(__dirname, htmlFileUrl), "utf-8");

    html = html.replace("VALUE_UNIT_NAME", `${datas.unit_name}`);
    html = html.replace("VALUE_UNIT_ADDRESS", `${datas.unit_address}`);
    html = html.replace("VALUE_UNIT_PHONE", `${datas.unit_phone}`);
    html = html.replace("VALUE_UNIT_PERSON", `${datas.unit_person}`);
    html = html.replace("VALUE_UNIT_PERSON_NAME", `${datas.unit_person_name}`);
    html = html.replace("VALUE_UNIT_PERSON_NIP", `${datas.unit_person_nip}`);
    html = html.replace("VALUE_UNIT_KOTA", `${datas.unit_kota}`);

    html = html.replace(
      "VALUE_TAHUN_AJARAN",
      `${datas.period_start}/${datas.period_end}`
    );
    html = html.replace(
      "VALUE_KELAS_SISWA",
      `${datas.majors_majors_name} - ${datas.class_class_name}`
    );
    html = html.replace("VALUE_NAMA_SISWA", datas.student_full_name);
    html = html.replace("VALUE_NIS_SISWA", datas.student_nis);
    html = html.replace(
      "VALUE_TANGGAL_DOKUMEN",
      ` ${moment().locale("id").format("DD MMMM YYYY")}`
    );
    html = html.replace("VALUE_NIP", "");
    let tableRows = "";
    datas.data_payment.forEach((data, index) => {
      tableRows += tableHtmlRincianPembayaran(data, index, datas);
    });
    html = html.replace("VALUE_TABEL_PEMBAYARAN", tableRows);

    const buffer = await module.exports.pdfGenerate(html);
    return buffer;
  },
  generateTagihanPembayaran: async (htmlFileUrl, datas) => {
    let html = fs.readFileSync(path.join(__dirname, htmlFileUrl), "utf-8");

    html = html.replace("VALUE_UNIT_NAME", `${datas.unit_name}`);
    html = html.replace("VALUE_UNIT_ADDRESS", `${datas.unit_address}`);
    html = html.replace("VALUE_UNIT_PHONE", `${datas.unit_phone}`);
    html = html.replace("VALUE_UNIT_PERSON", `${datas.unit_person}`);
    html = html.replace("VALUE_UNIT_PERSON_NAME", `${datas.unit_person_name}`);
    html = html.replace("VALUE_UNIT_PERSON_NIP", `${datas.unit_person_nip}`);
    html = html.replace("VALUE_UNIT_KOTA", `${datas.unit_kota}`);

    html = html.replace("VALUE_NIS_SISWA", datas.student_nis);
    html = html.replace("VALUE_NAMA_SISWA", datas.student_full_name);
    html = html.replace("VALUE_KELAS_SISWA", datas.class_class_name);
    html = html.replace(
      "VALUE_TAHUN_AJARAN",
      `${datas.period_start}/${datas.period_end}`
    );
    let tableRows = "";
    datas.current_billing.bill.forEach((data, index) => {
      tableRows += tableTagihanPembayaran(data, index, datas);
    });
    html = html.replace("VALUE_TABEL_TAHUN_AJARAN_SEKARANG", tableRows);
    html = html.replace(
      "VALUE_TOTAL_TAGIHAN_SISWA_SEKARANG",
      rupiahConvert(datas.current_billing.total_bill)
    );

    let tableRowsLalu = "";
    console.log(datas.previous_billing);
    datas.previous_billing.bill.forEach((data, index) => {
      tableRowsLalu += tableTagihanPembayaran(data, index, datas);
    });
    console.log(tableRowsLalu);
    html = html.replace("VALUE_TABEL_TAHUN_AJARAN_LALU", tableRowsLalu);
    html = html.replace(
      "VALUE_TOTAL_TAGIHAN_SISWA_LALU",
      rupiahConvert(datas.previous_billing.total_bill)
    );
    html = html.replace(
      "VALUE_TOTAL",
      rupiahConvert(
        datas.previous_billing.total_bill + datas.current_billing.total_bill
      )
    );
    html = html.replace(
      "VALUE_TANGGAL_DOKUMEN",
      ` ${moment().locale("id").format("DD MMMM YYYY")}`
    );
    html = html.replace("VALUE_NIP", "");

    const buffer = await module.exports.pdfGenerate(html);
    return buffer;
  },
  generateKwitansiPembayaran: async (htmlFileUrl, datas) => {
    let html = fs.readFileSync(path.join(__dirname, htmlFileUrl), "utf-8");

    html = html.replace("VALUE_UNIT_NAME", `${datas.unit_name}`);
    html = html.replace("VALUE_UNIT_ADDRESS", `${datas.unit_address}`);
    html = html.replace("VALUE_UNIT_PHONE", `${datas.unit_phone}`);
    html = html.replace("VALUE_UNIT_PERSON", `${datas.unit_person}`);
    html = html.replace("VALUE_UNIT_PERSON_NAME", `${datas.unit_person_name}`);
    html = html.replace("VALUE_UNIT_PERSON_NIP", `${datas.unit_person_nip}`);
    html = html.replace("VALUE_UNIT_KOTA", `${datas.unit_kota}`);

    html = html.replace("VALUE_NIS_SISWA", datas.student_nis);
    html = html.replace("VALUE_NAMA_SISWA", datas.student_full_name);
    html = html.replace("VALUE_KELAS_SISWA", datas.class_class_name);
    html = html.replace("VALUE_TAHUN_AJARAN", `${datas.tahun_ajaran}`);
    html = html.replace(
      "VALUE_TANGGAL_SISWA",
      `${dateConvert(
        datas.payment[0].payment_rate_date_pay ?? datas.payment[0].created_at
      )}`
    );
    html = html.replace("VALUE_NO_REFERENSI", `${datas.no_ref}`);
    html = html.replace(
      "VALUE_AKUN_KAS_SISWA",
      datas.payment[0]?.payment_rate_via_name
    );
    let tableRows = "";
    datas.payment.forEach((data, index) => {
      console.log(data);
      tableRows += tableKwitansiPembayaran(data, index, datas);
    });
    html = html.replace("VALUE_TABEL_PEMBAYARAN", tableRows);

    html = html.replace(
      "VALUE_TOTAL_PEMBAYARAN",
      `${rupiahConvert(datas.total)}`
    );
    html = html.replace(
      "VALUE_TERBILANG",
      `${terbilang_rupiah(datas.total)} Rupiah`
    );

    html = html.replace(
      "VALUE_TANGGAL_DOKUMEN",
      `${moment().locale("id").format("DD MMMM YYYY")}`
    );
    html = html.replace("VALUE_NIP", "");

    const buffer = await module.exports.pdfGenerate(html);
    return buffer;
  },

  generateKredit: async (htmlFileUrl, datas) => {
    console.log(datas);
    let html = fs.readFileSync(path.join(__dirname, htmlFileUrl), "utf-8");

    html = html.replace("VALUE_UNIT_NAME", `${datas.unit_name}`);
    html = html.replace("VALUE_UNIT_ADDRESS", `${datas.unit_address}`);
    html = html.replace("VALUE_UNIT_PHONE", `${datas.unit_phone}`);

    html = html.replace("VALUE_TITLE_DOKUMEN", "Bukti Kas Keluar");
    html = html.replace(/VALUE_NO_REFERENSI/g, datas?.data[0].kredit_no_ref);
    html = html.replace(
      "VALUE_AKUN_KAS",
      `${datas.data[0].account_cash_account_desc}`
    );
    html = html.replace(
      "VALUE_TANGGAL",
      dateConvert(datas.data[0].kredit_created_at)
    );
    html = html.replace("VALUE_RINCIAN", "pengeluaran");
    html = html.replace("VALUE_HEADER_JUMLAH", "Jumlah Pengeluaran");
    html = html.replace("VALUE_HEADER_TOTAL", "Jumlah Total Pengeluaran");
    html = html.replace(
      "VALUE_TERBILANG",
      `${terbilang_rupiah(datas.data[0].kredit_value)} Rupiah`
    );
    html = html.replace(
      "VALUE_TOTAL",
      rupiahConvert(parseInt(datas.data[0].kredit_value, 10))
    );

    let tableRows = "";
    datas.data.forEach((data, index) => {
      tableRows += tableKasKredit(data, index);
    });
    html = html.replace("VALUE_TABEL_KAS", tableRows);
    const buffer = await module.exports.pdfGenerate(html);
    return buffer;
  },

  generateDebit: async (htmlFileUrl, datas) => {
    let html = fs.readFileSync(path.join(__dirname, htmlFileUrl), "utf-8");

    html = html.replace("VALUE_UNIT_NAME", `${datas.unit_name}`);
    html = html.replace("VALUE_UNIT_ADDRESS", `${datas.unit_address}`);
    html = html.replace("VALUE_UNIT_PHONE", `${datas.unit_phone}`);

    html = html.replace("VALUE_TITLE_DOKUMEN", "Bukti Kas Keluar");
    html = html.replace(/VALUE_NO_REFERENSI/g, datas.data[0].debit_no_ref);
    html = html.replace(
      "VALUE_AKUN_KAS",
      `${datas.data[0].account_cash_account_desc}`
    );
    html = html.replace(
      "VALUE_TANGGAL",
      dateConvert(datas.data[0].debit_created_at)
    );
    html = html.replace("VALUE_RINCIAN", "pengeluaran");
    html = html.replace("VALUE_HEADER_JUMLAH", "Jumlah Pemasukan");
    html = html.replace("VALUE_HEADER_TOTAL", "Jumlah Total Pemasukan");
    html = html.replace(
      "VALUE_TERBILANG",
      `${terbilang_rupiah(datas.data[0].debit_value)} Rupiah`
    );
    html = html.replace(
      "VALUE_TOTAL",
      rupiahConvert(parseInt(datas.data[0].debit_value, 10))
    );

    let tableRows = "";
    datas.data.forEach((data, index) => {
      tableRows += tableKasDebit(data, index);
    });
    html = html.replace("VALUE_TABEL_KAS", tableRows);
    const buffer = await module.exports.pdfGenerate(html);
    return buffer;
  },

  async generateDokumenLaporanPerKelas(htmlFileUrl, datas) {
    // baca file
    let html = fs.readFileSync(path.join(__dirname, htmlFileUrl), "utf-8");

    html = html.replace("VALUE_UNIT_NAME", `${datas.unit_name}`);
    html = html.replace("VALUE_UNIT_ADDRESS", `${datas.unit_address}`);
    html = html.replace("VALUE_UNIT_PHONE", `${datas.unit_phone}`);
    html = html.replace("VALUE_UNIT_PERSON", `${datas.unit_person}`);
    html = html.replace("VALUE_UNIT_PERSON_NAME", `${datas.unit_person_name}`);
    html = html.replace("VALUE_UNIT_PERSON_NIP", `${datas.unit_person_nip}`);
    html = html.replace("VALUE_UNIT_KOTA", `${datas.unit_kota}`);

    html = html.replace("VALUE_TAHUN_AJARAN", `${datas.tahun_ajaran}`);
    html = html.replace("VALUE_TITLE_DOKUMEN", datas.title);
    html = html.replace("VALUE_KELAS", `${datas.class}`);

    html = html.replace(
      "VALUE_TANGGAL_DOKUMEN",
      ` ${moment().locale("id").format("DD MMMM YYYY")}`
    );
    html = html.replace("VALUE_NIP", "");
    let tableRows = "";

    datas.students?.forEach((dataStudent, index) => {
      tableRows += tableLaporanPerKelas(dataStudent, index, datas);
    });

    html = html.replace("VALUE_TABEL_PEMBAYARAN_PER_KELAS", tableRows);
    console.log(
      datas.students?.reduce(
        (accumulator, currentValue) => accumulator + currentValue.sudah_dibayar,
        0
      )
    );
    html = html.replace(
      "VALUE_TOTAL_PEMBAYARAN_SISWA",
      rupiahConvert(
        datas.students?.reduce(
          (accumulator, currentValue) =>
            accumulator + currentValue.sudah_dibayar,
          0
        )
      )
    );

    const buffer = await module.exports.pdfGenerate(html);
    return buffer;
  },
  async generateDokumenLaporanPerTanggal(htmlFileUrl, datas) {
    // baca file
    let html = fs.readFileSync(path.join(__dirname, htmlFileUrl), "utf-8");

    html = html.replace("VALUE_UNIT_NAME", `${datas.unit_name}`);
    html = html.replace("VALUE_UNIT_ADDRESS", `${datas.unit_address}`);
    html = html.replace("VALUE_UNIT_PHONE", `${datas.unit_phone}`);
    html = html.replace("VALUE_UNIT_PERSON", `${datas.unit_person}`);
    html = html.replace("VALUE_UNIT_PERSON_NAME", `${datas.unit_person_name}`);
    html = html.replace("VALUE_UNIT_PERSON_NIP", `${datas.unit_person_nip}`);
    html = html.replace("VALUE_UNIT_KOTA", `${datas.unit_kota}`);

    html = html.replace("VALUE_TAHUN_AJARAN", `${datas.tahun_ajaran}`);
    html = html.replace("VALUE_TITLE_DOKUMEN", datas.title);
    html = html.replace("VALUE_KELAS", `${datas.class}`);

    html = html.replace(
      "VALUE_TANGGAL_DOKUMEN",
      ` ${moment().locale("id").format("DD MMMM YYYY")}`
    );
    html = html.replace("VALUE_NIP", "");
    let tableRows = "";
    datas.payment_type.forEach((data, index) => {
      tableRows += headerTableLaporanPerTanggal(
        `${data.pos_pay_name} T.A ${data.period_start}/${data.period_end}`
      );
      data.payment?.forEach((dataPayment, index) => {
        tableRows += tableLaporanPerTanggal(index, dataPayment, data);
      });
      tableRows += footerTableLaporanPerTanggal(data);
    });
    html = html.replace("VALUE_TABEL_PEMBAYARAN_PER_TANGGAL", tableRows);
    html = html.replace(
      "VALUE_TOTAL_KESELURUHAN",
      rupiahConvert(
        datas.payment_type?.reduce(
          (accumulator, currentValue) => accumulator + currentValue.total,
          0
        )
      )
    );

    const buffer = await module.exports.pdfGenerate(html);
    return buffer;
  },
  async generateDokumenLaporanKas(htmlFileUrl, datas) {
    // baca file
    let html = fs.readFileSync(path.join(__dirname, htmlFileUrl), "utf-8");

    html = html.replace("VALUE_UNIT_NAME", `${datas.unit_name}`);
    html = html.replace("VALUE_UNIT_ADDRESS", `${datas.unit_address}`);
    html = html.replace("VALUE_UNIT_PHONE", `${datas.unit_phone}`);
    html = html.replace("VALUE_UNIT_PERSON", `${datas.unit_person}`);
    html = html.replace("VALUE_UNIT_PERSON_NAME", `${datas.unit_person_name}`);
    html = html.replace("VALUE_UNIT_PERSON_NIP", `${datas.unit_person_nip}`);
    html = html.replace("VALUE_UNIT_KOTA", `${datas.unit_kota}`);

    html = html.replace("VALUE_TAHUN_AJARAN", `${datas.tahun_ajaran}`);
    html = html.replace("VALUE_TITLE_DOKUMEN", datas.title);
    html = html.replace("VALUE_UNIT", `${datas.unit}`);

    html = html.replace(
      "VALUE_TANGGAL_DOKUMEN",
      ` ${moment().locale("id").format("DD MMMM YYYY")}`
    );
    html = html.replace("VALUE_NIP", "");

    let tableRowsDebit = "";
    datas.data_payment
      .filter(
        (item) =>
          item.account_cost_account_code.includes("4-4") ||
          item.account_code.includes("4-4")
      )
      .forEach((data, index) => {
        tableRowsDebit += tableLaporanKas(index, data, datas);
      });
    html = html.replace("VALUE_TABEL_PENERIMAAN", tableRowsDebit);

    let tableRowsKredit = "";
    datas.data_payment
      .filter(
        (item) =>
          item.account_cost_account_code.includes("5-5") ||
          item.account_code.includes("5-5")
      )
      .forEach((data, index) => {
        tableRowsKredit += tableLaporanKas(index, data, datas);
      });
    html = html.replace("VALUE_TABEL_PENGELUARAN", tableRowsKredit);

    html = html.replace(
      "VALUE_TOTAL_DEBIT",
      rupiahConvert(datas.sub_total_masuk)
    );
    html = html.replace(
      "VALUE_TOTAL_KREDIT",
      rupiahConvert(datas.sub_total_keluar)
    );

    html = html.replace(
      "VALUE_SUB_TOTAL_DEBIT",
      rupiahConvert(datas.sub_total_masuk)
    );
    html = html.replace(
      "VALUE_SUB_TOTAL_CREDIT",
      rupiahConvert(datas.sub_total_keluar)
    );
    html = html.replace(
      "VALUE_SALDO_AWAL_DEBIT",
      rupiahConvert(datas.saldo_awal_debit)
    );
    html = html.replace(
      "VALUE_SALDO_AWAL_CREDIT",
      rupiahConvert(datas.saldo_awal_kredit)
    );
    html = html.replace(
      "VALUE_TOTAL_AKHIR_DEBIT",
      rupiahConvert(datas.total_masuk)
    );
    html = html.replace(
      "VALUE_TOTAL_AKHIR_CREDIT",
      rupiahConvert(datas.total_keluar)
    );
    html = html.replace(
      "VALUE_SALDO_AKHIR_DEBIT",
      rupiahConvert(datas.saldo_akhir)
    );
    html = html.replace("VALUE_SALDO_AKHIR_CREDIT", "-");
    // html = html.replace("VALUE_TOTAL_KESELURUHAN", rupiahConvert(datas.payment_type?.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0)));

    const buffer = await module.exports.pdfGenerate(html);
    return buffer;
  },
  async generateDokumenLaporanKasPerAnggaran(htmlFileUrl, datas, dataAccount) {
    console.log(dataAccount[1].data_payment);
    // baca file
    let html = fs.readFileSync(path.join(__dirname, htmlFileUrl), "utf-8");

    html = html.replace("VALUE_UNIT_NAME", `${datas.unit_name}`);
    html = html.replace("VALUE_UNIT_ADDRESS", `${datas.unit_address}`);
    html = html.replace("VALUE_UNIT_PHONE", `${datas.unit_phone}`);
    html = html.replace("VALUE_UNIT_PERSON", `${datas.unit_person}`);
    html = html.replace("VALUE_UNIT_PERSON_NAME", `${datas.unit_person_name}`);
    html = html.replace("VALUE_UNIT_PERSON_NIP", `${datas.unit_person_nip}`);
    html = html.replace("VALUE_UNIT_KOTA", `${datas.unit_kota}`);

    html = html.replace("VALUE_TAHUN_AJARAN", `${datas.tahun_ajaran}`);
    html = html.replace("VALUE_TITLE_DOKUMEN", datas.title);
    html = html.replace("VALUE_UNIT", `${datas.unit}`);

    html = html.replace(
      "VALUE_TANGGAL_DOKUMEN",
      ` ${moment().locale("id").format("DD MMMM YYYY")}`
    );
    html = html.replace("VALUE_NIP", "");

    let tableRowsDebit = "";
    dataAccount
      .filter((item) => item.code.includes("4-4"))
      .forEach((data, index) => {
        tableRowsDebit += tableLaporanKasPerAnggaran(
          index,
          data.data_payment.debit,
          "sub_total_masuk",
          `${data.code}-${data.description}`
        );
      });
    html = html.replace("VALUE_TABEL_PENERIMAAN", tableRowsDebit);

    let tableRowsKredit = "";
    dataAccount
      .filter((item) => item.code.includes("5-5"))
      .forEach((data, index) => {
        tableRowsKredit += tableLaporanKasPerAnggaran(
          index,
          data.data_payment.kredit,
          "sub_total_keluar",
          `${data.code}-${data.description}`
        );
      });
    html = html.replace("VALUE_TABEL_PENGELUARAN", tableRowsKredit);

    html = html.replace(
      "VALUE_TOTAL_DEBIT",
      rupiahConvert(datas.sub_total_masuk)
    );
    html = html.replace(
      "VALUE_TOTAL_KREDIT",
      rupiahConvert(datas.sub_total_keluar)
    );

    html = html.replace(
      "VALUE_SUB_TOTAL_DEBIT",
      rupiahConvert(datas.sub_total_masuk)
    );
    html = html.replace(
      "VALUE_SUB_TOTAL_CREDIT",
      rupiahConvert(datas.sub_total_keluar)
    );
    html = html.replace(
      "VALUE_SALDO_AWAL_DEBIT",
      rupiahConvert(datas.saldo_awal_debit)
    );
    html = html.replace(
      "VALUE_SALDO_AWAL_CREDIT",
      rupiahConvert(datas.saldo_awal_kredit)
    );
    html = html.replace(
      "VALUE_TOTAL_AKHIR_DEBIT",
      rupiahConvert(datas.total_masuk)
    );
    html = html.replace(
      "VALUE_TOTAL_AKHIR_CREDIT",
      rupiahConvert(datas.total_keluar)
    );
    html = html.replace(
      "VALUE_SALDO_AKHIR_DEBIT",
      rupiahConvert(datas.saldo_akhir)
    );
    html = html.replace("VALUE_SALDO_AKHIR_CREDIT", "-");
    // html = html.replace("VALUE_TOTAL_KESELURUHAN", rupiahConvert(datas.payment_type?.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0)));

    const buffer = await module.exports.pdfGenerate(html);
    return buffer;
  },
  async generateDokumenJurnalUmum(htmlFileUrl, datas) {
    // baca file
    let html = fs.readFileSync(path.join(__dirname, htmlFileUrl), "utf-8");

    html = html.replace("VALUE_UNIT_NAME", `${datas.unit_name}`);
    html = html.replace("VALUE_UNIT_ADDRESS", `${datas.unit_address}`);
    html = html.replace("VALUE_UNIT_PHONE", `${datas.unit_phone}`);
    html = html.replace("VALUE_UNIT_PERSON", `${datas.unit_person}`);
    html = html.replace("VALUE_UNIT_PERSON_NAME", `${datas.unit_person_name}`);
    html = html.replace("VALUE_UNIT_PERSON_NIP", `${datas.unit_person_nip}`);
    html = html.replace("VALUE_UNIT_KOTA", `${datas.unit_kota}`);

    html = html.replace("VALUE_TAHUN_AJARAN", `${datas.tahun_ajaran}`);
    html = html.replace("VALUE_TITLE_DOKUMEN", datas.title);
    html = html.replace("VALUE_UNIT", `${datas.unit}`);

    html = html.replace(
      "VALUE_TANGGAL_DOKUMEN",
      ` ${moment().locale("id").format("DD MMMM YYYY")}`
    );
    html = html.replace("VALUE_NIP", "");

    let tableRowsDebit = "";
    datas.data_payment
      .filter(
        (item) =>
          item.account_cost_account_code?.includes("4-4") ||
          item.account_code?.includes("4-4")
      )
      .forEach((data, index) => {
        tableRowsDebit += tableLaporanJurnalUmum(index, data, datas);
      });
    html = html.replace("VALUE_TABEL_PENERIMAAN", tableRowsDebit);

    let tableRowsKredit = "";
    datas.data_payment
      .filter(
        (item) =>
          item.account_cost_account_code?.includes("5-5") ||
          item.account_code?.includes("5-5")
      )
      .forEach((data, index) => {
        tableRowsKredit += tableLaporanJurnalUmum(index, data, datas);
      });
    html = html.replace("VALUE_TABEL_PENGELUARAN", tableRowsKredit);

    html = html.replace(
      "VALUE_TOTAL_DEBIT",
      rupiahConvert(datas.sub_total_masuk)
    );
    html = html.replace(
      "VALUE_TOTAL_KREDIT",
      rupiahConvert(datas.sub_total_keluar)
    );

    html = html.replace(
      "VALUE_SUB_TOTAL_DEBIT",
      rupiahConvert(datas.sub_total_masuk)
    );
    html = html.replace(
      "VALUE_SUB_TOTAL_CREDIT",
      rupiahConvert(datas.sub_total_keluar)
    );
    html = html.replace(
      "VALUE_SALDO_AWAL_DEBIT",
      rupiahConvert(datas.saldo_awal_debit)
    );
    html = html.replace(
      "VALUE_SALDO_AWAL_CREDIT",
      rupiahConvert(datas.saldo_awal_kredit)
    );
    html = html.replace(
      "VALUE_TOTAL_AKHIR_DEBIT",
      rupiahConvert(datas.total_masuk)
    );
    html = html.replace(
      "VALUE_TOTAL_AKHIR_CREDIT",
      rupiahConvert(datas.total_keluar)
    );
    html = html.replace(
      "VALUE_SALDO_AKHIR_DEBIT",
      rupiahConvert(datas.saldo_akhir)
    );
    html = html.replace("VALUE_SALDO_AKHIR_CREDIT", "-");
    // html = html.replace("VALUE_TOTAL_KESELURUHAN", rupiahConvert(datas.payment_type?.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0)));

    const buffer = await module.exports.pdfGenerate(html);
    return buffer;
  },
  async generateDokumenLaporanJurnalUmumPerAnggaran(
    htmlFileUrl,
    datas,
    dataAccount
  ) {
    console.log(dataAccount[1].data_payment);
    // baca file
    let html = fs.readFileSync(path.join(__dirname, htmlFileUrl), "utf-8");

    html = html.replace("VALUE_UNIT_NAME", `${datas.unit_name}`);
    html = html.replace("VALUE_UNIT_ADDRESS", `${datas.unit_address}`);
    html = html.replace("VALUE_UNIT_PHONE", `${datas.unit_phone}`);
    html = html.replace("VALUE_UNIT_PERSON", `${datas.unit_person}`);
    html = html.replace("VALUE_UNIT_PERSON_NAME", `${datas.unit_person_name}`);
    html = html.replace("VALUE_UNIT_PERSON_NIP", `${datas.unit_person_nip}`);
    html = html.replace("VALUE_UNIT_KOTA", `${datas.unit_kota}`);

    html = html.replace("VALUE_TAHUN_AJARAN", `${datas.tahun_ajaran}`);
    html = html.replace("VALUE_TITLE_DOKUMEN", datas.title);
    html = html.replace("VALUE_UNIT", `${datas.unit}`);

    html = html.replace(
      "VALUE_TANGGAL_DOKUMEN",
      ` ${moment().locale("id").format("DD MMMM YYYY")}`
    );
    html = html.replace("VALUE_NIP", "");

    let tableRowsDebit = "";
    dataAccount
      .filter((item) => item.code.includes("4-4"))
      .forEach((data, index) => {
        tableRowsDebit += tableLaporanJurnalPerAnggaran(
          index,
          data.data_payment.debit,
          "sub_total_masuk",
          `${data.code}-${data.description}`
        );
      });
    html = html.replace("VALUE_TABEL_PENERIMAAN", tableRowsDebit);

    let tableRowsKredit = "";
    dataAccount
      .filter((item) => item.code.includes("5-5"))
      .forEach((data, index) => {
        tableRowsKredit += tableLaporanJurnalPerAnggaran(
          index,
          data.data_payment.kredit,
          "sub_total_keluar",
          `${data.code}-${data.description}`
        );
      });
    html = html.replace("VALUE_TABEL_PENGELUARAN", tableRowsKredit);

    html = html.replace(
      "VALUE_TOTAL_DEBIT",
      rupiahConvert(datas.sub_total_masuk)
    );
    html = html.replace(
      "VALUE_TOTAL_KREDIT",
      rupiahConvert(datas.sub_total_keluar)
    );

    html = html.replace(
      "VALUE_SUB_TOTAL_DEBIT",
      rupiahConvert(datas.sub_total_masuk)
    );
    html = html.replace(
      "VALUE_SUB_TOTAL_CREDIT",
      rupiahConvert(datas.sub_total_keluar)
    );
    html = html.replace(
      "VALUE_SALDO_AWAL_DEBIT",
      rupiahConvert(datas.saldo_awal_debit)
    );
    html = html.replace(
      "VALUE_SALDO_AWAL_CREDIT",
      rupiahConvert(datas.saldo_awal_kredit)
    );
    html = html.replace(
      "VALUE_TOTAL_AKHIR_DEBIT",
      rupiahConvert(datas.total_masuk)
    );
    html = html.replace(
      "VALUE_TOTAL_AKHIR_CREDIT",
      rupiahConvert(datas.total_keluar)
    );
    html = html.replace(
      "VALUE_SALDO_AKHIR_DEBIT",
      rupiahConvert(datas.saldo_akhir)
    );
    html = html.replace("VALUE_SALDO_AKHIR_CREDIT", "-");
    // html = html.replace("VALUE_TOTAL_KESELURUHAN", rupiahConvert(datas.payment_type?.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0)));

    const buffer = await module.exports.pdfGenerate(html);
    return buffer;
  },
};
