/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
const moment = require("moment");
const XLSX = require("xlsx-js-style");
const helpers = require("../helpers");
const {
  pdfGenerate,
  generateRincianPembayaran,
  generateTagihanPembayaran,
  generateKwitansiPembayaran,
  generateKredit,
  generateDebit,
  generateDokumenLaporanPerKelas,
  generateDokumenLaporanKas,
  generateDokumenJurnalUmum,
  generateDokumenLaporanKasPerAnggaran,
  generateDokumenLaporanJurnalUmumPerAnggaran,
  generateDokumenLaporanPerTanggal,
} = require("../middleware/documentService");
const { promiseHandler } = require("../middleware/promiseHandler");
const monthlyPaymentModel = require("../models/monthly-payment");
const freePaymentModel = require("../models/free-payment");
const paymentRateModel = require("../models/payment-rate");
const detailFreePaymentModel = require("../models/detail-free-payment-transaction");
const paymentTransactionModel = require("../models/payment-transaction");
const kreditModel = require("../models/kredit");
const debitModel = require("../models/debit");
const tahunAjaranModel = require("../models/tahun-ajaran");
const studentModel = require("../models/siswa");
const unitModel = require("../models/unit");
const periodModel = require("../models/tahun-ajaran");
const classModel = require("../models/kelas");
const monthModel = require("../models/month");
const paymentTypeModel = require("../models/payment-type");
const cashAccountModel = require("../models/cash-account");
const { decryptData, encryptData } = require("../utils/encrypt");
const posPayModel = require("../models/pos-pay");
const {
  generateExcelLaporanKasKeuangan,
  generateExcelLaporanPembayaranPerTanggal,
  generateExcelLaporanRekapPembayaran,
} = require("../service/excelService");
const { includes } = require("../validator/pos-pay");

moment.locale("id");

module.exports = {
  getDokumenTagihanPembayaran: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { unit_id } = req.query;
    const dataSiswa = await studentModel.getSiswaById(id);
    const resultMonthly = await monthlyPaymentModel.getMonthlyPaymentByStudent(
      id
    );
    const unitResult = await unitModel.getUnitById(unit_id);

    const resultTahunAjaran = await tahunAjaranModel.getAllTahunAjaran();
    const currentTahunAjaran = resultTahunAjaran.filter(
      (item) => item.period_status == 1
    )[0];
    const resultFree = await freePaymentModel.getFreePaymentByStudent(id);
    const allBilling = [
      ...resultMonthly.filter((item) => item.payment_rate_status == 0),
      ...resultFree
        .filter((item) => item.payment_rate_status == 0)
        .map((item) => ({
          ...item,
          payment_rate_bill:
            item.payment_rate_bill -
            item.payment_rate_discount -
            item.payment_rate_total_pay,
        })),
    ];
    const currentBilling = allBilling.filter(
      (item) =>
        item.period_start == currentTahunAjaran.period_start &&
        item.period_end == currentTahunAjaran.period_end
    );
    const previousBilling = allBilling.filter(
      (item) =>
        item.period_start < currentTahunAjaran.period_start &&
        item.period_end < currentTahunAjaran.period_end
    );
    console.log(previousBilling);
    const resultObject = {
      ...dataSiswa,
      unit_name: `${unitResult.unit_name}  ${unitResult.unit_full_name}`,
      unit_address: unitResult.unit_address,
      unit_phone: unitResult.unit_phone,
      unit_person: unitResult.unit_person,
      unit_person_name: unitResult.unit_person_name,
      unit_person_nip: unitResult.unit_person_nip,
      unit_kota: unitResult.unit_kota,
      ...currentTahunAjaran,
      current_billing: {
        total_bill: currentBilling.reduce(
          (accumulator, currentValue) =>
            accumulator + parseInt(currentValue.payment_rate_bill, 10),
          0
        ),
        bill: currentBilling,
      },
      previous_billing: {
        total_bill: previousBilling.reduce(
          (accumulator, currentValue) =>
            accumulator + parseInt(currentValue.payment_rate_bill, 10),
          0
        ),
        bill: previousBilling,
      },
    };

    const result = await generateTagihanPembayaran(
      "../assets/pdfTemplate/tagihan-pembayaran.html",
      resultObject
    );
    console.log(result);
    return helpers.response(
      res,
      200,
      "GET dokumen tagihan pembayaran berhasil",
      result
    );
  }),
  getDokumenKredit: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { unit_id } = req.query;
    const { user_id } = req.token;
    const data = await kreditModel.getKreditDokumenById(id);

    let resultUnit;
    if (unit_id != "") {
      resultUnit = await unitModel.getUnitById(unit_id);
    } else {
      resultUnit = await unitModel.getUnitByUser(user_id);
    }

    const result = await generateKredit(
      "../assets/pdfTemplate/dokumen-kas.html",
      {
        unit_name: `${unit_id == "" ? "" : resultUnit.unit_name}  ${
          resultUnit.unit_full_name ?? resultUnit[0].unit_full_name
        }`,
        unit_address: resultUnit.unit_address ?? resultUnit[0].unit_address,
        unit_phone: resultUnit.unit_phone ?? resultUnit[0].unit_phone,
        data,
      }
    );
    console.log(result);
    return helpers.response(res, 200, "GET dokumen kredit berhasil", result);
  }),
  getDokumenDebit: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { unit_id } = req.query;
    const { user_id } = req.token;
    const data = await debitModel.getDebitDokumenById(id);
    let resultUnit;
    if (unit_id != "") {
      resultUnit = await unitModel.getUnitById(unit_id);
    } else {
      resultUnit = await unitModel.getUnitByUser(user_id);
    }

    const result = await generateDebit(
      "../assets/pdfTemplate/dokumen-kas.html",
      {
        unit_name: `${unit_id == "" ? "" : resultUnit.unit_name}  ${
          resultUnit.unit_full_name ?? resultUnit[0].unit_full_name
        }`,
        unit_address: resultUnit.unit_address ?? resultUnit[0].unit_address,
        unit_phone: resultUnit.unit_phone ?? resultUnit[0].unit_phone,
        data,
      }
    );
    console.log(result);
    return helpers.response(res, 200, "GET dokumen kredit berhasil", result);
  }),
  getPublicDokumenTagihanPembayaran: promiseHandler(async (req, res, next) => {
    const paramsData = {
      iv: req.query.iv,
      encryptedData: req.query.encryptedData,
    };
    console.log(paramsData);
    const decryptedData = await decryptData(paramsData);
    const id = decryptedData;
    console.log(id);
    const dataSiswa = await studentModel.getSiswaById(id);
    const unitResult = await unitModel.getUnitById(dataSiswa.unit_unit_id);

    const resultMonthly = await monthlyPaymentModel.getMonthlyPaymentByStudent(
      id
    );
    const resultTahunAjaran = await tahunAjaranModel.getAllTahunAjaran();
    const currentTahunAjaran = resultTahunAjaran.filter(
      (item) => item.period_status == 1
    )[0];
    const resultFree = await freePaymentModel.getFreePaymentByStudent(id);
    const allBilling = [
      ...resultMonthly.filter((item) => item.payment_rate_status == 0),
      ...resultFree
        .filter((item) => item.payment_rate_status == 0)
        .map((item) => ({
          ...item,
          payment_rate_bill:
            item.payment_rate_bill -
            item.payment_rate_discount -
            item.payment_rate_total_pay,
        })),
    ];
    const currentBilling = allBilling.filter(
      (item) =>
        item.period_start == currentTahunAjaran.period_start &&
        item.period_end == currentTahunAjaran.period_end
    );
    const previousBilling = allBilling.filter(
      (item) =>
        item.period_start < currentTahunAjaran.period_start &&
        item.period_end < currentTahunAjaran.period_end
    );
    const resultObject = {
      ...dataSiswa,
      unit_name: `${unitResult.unit_name}  ${unitResult.unit_full_name}`,
      unit_address: unitResult.unit_address,
      unit_phone: unitResult.unit_phone,
      unit_person: unitResult.unit_person,
      unit_person_name: unitResult.unit_person_name,
      unit_person_nip: unitResult.unit_person_nip,
      unit_kota: unitResult.unit_kota,
      ...currentTahunAjaran,
      current_billing: {
        total_bill: currentBilling.reduce(
          (accumulator, currentValue) =>
            accumulator + parseInt(currentValue.payment_rate_bill, 10),
          0
        ),
        bill: currentBilling,
      },
      previous_billing: {
        total_bill: previousBilling.reduce(
          (accumulator, currentValue) =>
            accumulator + parseInt(currentValue.payment_rate_bill, 10),
          0
        ),
        bill: previousBilling,
      },
    };

    const result = await generateTagihanPembayaran(
      "../assets/pdfTemplate/tagihan-pembayaran.html",
      resultObject
    );
    console.log(result);
    return helpers.response(
      res,
      200,
      "GET dokumen tagihan pembayaran berhasil",
      result
    );
  }),

  getKwitansiPembayaran: promiseHandler(async (req, res, next) => {
    const { student_id, no_referensi, period_start, period_end, unit_id } =
      req.body;

    const dataSiswa = await studentModel.getSiswaById(student_id);

    const resultFreePayment =
      await freePaymentModel.getDetailFreePaymentTypeByReference(no_referensi);
    const resultMonthlPayment =
      await monthlyPaymentModel.getMonthlyPaymentByReferenceNumber(
        student_id,
        no_referensi
      );
    console.log(resultFreePayment);
    const unitResult = await unitModel.getUnitById(unit_id);

    // console.log(resultMonthlPayment);
    /// lanjut sini
    const newFormatResultFree = resultFreePayment.map((item) => ({
      ...item,
      payment_rate_number_pay: item.payment_rate_bebas_pay_number,
    }));

    const allResult = [...resultMonthlPayment, ...newFormatResultFree];

    // const allResult = [...resultMonthly, ...newFormatResultFree].filter(
    //   (item, index, arr) =>
    //     index ===
    //     arr.findIndex(
    //       (t) => item.payment_rate_number_pay == t.payment_rate_number_pay
    //     )
    // );
    // return helpers.response(res, 200, "Sukses", allResult);
    const resultObject = {
      ...dataSiswa,
      unit_name: `${unitResult.unit_name}  ${unitResult.unit_full_name}`,
      unit_address: unitResult.unit_address,
      unit_phone: unitResult.unit_phone,
      unit_person: unitResult.unit_person,
      unit_person_name: unitResult.unit_person_name,
      unit_person_nip: unitResult.unit_person_nip,
      unit_kota: unitResult.unit_kota,
      tahun_ajaran: `${period_start}/${period_end}`,
      payment: [...allResult],
      no_ref: no_referensi,
      total: allResult.reduce(
        (accumulator, currentValue) =>
          accumulator +
          parseInt(
            currentValue.payment_rate_bebas_pay_bill
              ? currentValue.payment_rate_bebas_pay_bill
              : currentValue.payment_rate_bill,
            10
          ),
        0
      ),
    };

    const result = await generateKwitansiPembayaran(
      "../assets/pdfTemplate/dokumen-kwitansi.html",
      resultObject
    );
    console.log(result);
    return helpers.response(
      res,
      200,
      "GET dokumen tagihan pembayaran berhasil",
      result
    );
  }),
  getPublicDokumenBuktiPembayaran: promiseHandler(async (req, res, next) => {
    const paramsData = {
      iv: req.query.iv,
      encryptedData: req.query.encryptedData,
    };
    const decryptedData = await decryptData(paramsData);
    const { student_id, no_referensi, period_start, period_end } =
      JSON.parse(decryptedData);

    const dataSiswa = await studentModel.getSiswaById(student_id);

    const resultFreePayment =
      await freePaymentModel.getDetailFreePaymentTypeByReference(no_referensi);
    const resultMonthlPayment =
      await monthlyPaymentModel.getMonthlyPaymentByReferenceNumber(
        student_id,
        no_referensi
      );
    /// lanjut sini
    const newFormatResultFree = resultFreePayment.map((item) => ({
      ...item,
      payment_rate_number_pay: item.payment_rate_bebas_pay_number,
    }));

    const allResult = [...resultMonthlPayment, ...newFormatResultFree];
    const unitResult = await unitModel.getUnitById(dataSiswa.unit_unit_id);

    // const allResult = [...resultMonthly, ...newFormatResultFree].filter(
    //   (item, index, arr) =>
    //     index ===
    //     arr.findIndex(
    //       (t) => item.payment_rate_number_pay == t.payment_rate_number_pay
    //     )
    // );
    // return helpers.response(res, 200, "Sukses", allResult);
    const resultObject = {
      ...dataSiswa,
      unit_name: `${unitResult.unit_name}  ${unitResult.unit_full_name}`,
      unit_address: unitResult.unit_address,
      unit_phone: unitResult.unit_phone,
      unit_person: unitResult.unit_person,
      unit_person_name: unitResult.unit_person_name,
      unit_person_nip: unitResult.unit_person_nip,
      unit_kota: unitResult.unit_kota,
      tahun_ajaran: `${period_start}/${period_end}`,
      payment: [...allResult],
      no_ref: no_referensi,
      total: allResult.reduce(
        (accumulator, currentValue) =>
          accumulator +
          parseInt(
            currentValue.payment_rate_bebas_pay_bill
              ? currentValue.payment_rate_bebas_pay_bill
              : currentValue.payment_rate_bill,
            10
          ),
        0
      ),
    };

    const result = await generateKwitansiPembayaran(
      "../assets/pdfTemplate/dokumen-kwitansi.html",
      resultObject
    );
    console.log(result);
    return helpers.response(
      res,
      200,
      "GET dokumen tagihan pembayaran berhasil",
      result
    );
  }),
  getDokumenRincianPembayaran: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { period_start, period_end, unit_id } = req.query;
    const dataSiswa = await studentModel.getSiswaById(id);
    const unitResult = await unitModel.getUnitById(unit_id);

    const resultMonthly = await monthlyPaymentModel.getMonthlyPaymentByStudent(
      id,
      period_start,
      period_end
    );
    const resultFree = await freePaymentModel.getFreePaymentByStudent(
      id,
      period_start,
      period_end
    );

    const monthlyPaymentType =
      await monthlyPaymentModel.getMonthlyPaymentTypeByStudent(id);
    const freePaymentType = await freePaymentModel.getFreePaymentTypeByStudent(
      id
    );
    const listPayment = [
      ...resultFree
        .filter((item) =>
          freePaymentType.some(
            (itemFilter) => item.payment_rate_id === itemFilter.payment_rate_id
          )
        )
        .map((item) => ({
          ...item,
          payment_rate_bill: parseInt(item.payment_rate_bill),
        })),
      ,
      ...resultMonthly
        .filter((item) =>
          monthlyPaymentType.some(
            (itemFilter) => item.payment_rate_id === itemFilter.payment_rate_id
          )
        )
        .map((item) => ({
          ...item,
          payment_rate_bill: parseInt(item.payment_rate_bill),
        })),
      ,
    ];

    const allResult = {
      ...dataSiswa,
      unit_name: `${unitResult.unit_name}  ${unitResult.unit_full_name}`,
      unit_address: unitResult.unit_address,
      unit_phone: unitResult.unit_phone,
      unit_person: unitResult.unit_person,
      unit_person_name: unitResult.unit_person_name,
      unit_person_nip: unitResult.unit_person_nip,
      unit_kota: unitResult.unit_kota,
      period_start,
      period_end,
      sisa_tagihan: listPayment.reduce(
        (accumulator, currentValue) =>
          accumulator +
          (parseInt(currentValue.payment_rate_bebas_pay_bill, 10) -
            (currentValue.payment_rate_discount || 0) -
            currentValue.payment_rate_total_pay),
        0
      ),
      data_payment: listPayment,
    };

    // const freeType = {
    //   free_type: freePaymentType.map((item) => ({
    //     ...item,
    //     detail_payment: resultFree
    //       .filter(
    //         (itemFree) => item.payment_rate_id === itemFree.payment_rate_id
    //       )
    //       .map((item) => ({
    //         ...item,
    //         payment_rate_bill: parseInt(item.payment_rate_bill),
    //       })),
    //   })),
    // };

    // const newResult = {
    //   monthly_type: monthlyPaymentType.map((item) => ({
    //     ...item,
    //     monthly_payment: resultMonthly
    //       .filter(
    //         (itemMonthly) =>
    //           item.payment_rate_id === itemMonthly.payment_rate_id
    //       )
    //       .map((item) => ({
    //         ...item,
    //         payment_rate_bill: parseInt(item.payment_rate_bill),
    //       })),
    //   })),
    //   ...freeType,
    // };
    const result = await generateRincianPembayaran(
      "../assets/pdfTemplate/rincian-pembayaran.html",
      allResult
    );
    return helpers.response(
      res,
      200,
      "Get dokumen rincian pembayaran berhasil",
      result
    );
  }),

  // dokumen laporan
  dokumenlaporanPembayaranPerKelas: promiseHandler(async (req, res, next) => {
    const { unit_id, class_id, period_id, payment_type } = req.query;
    const posPayType = await posPayModel.getPosPayById(payment_type);
    const periodResult = await tahunAjaranModel.getTahunAjaranById(period_id);
    const unitResult = await unitModel.getUnitById(unit_id);
    let classResult = null;
    if (class_id !== "") classResult = await classModel.getKelasById(class_id);
    const queryFormat = {};
    console.log(class_id);
    // untuk penyesuaian query di sql
    queryFormat.class_class_id =
      class_id == "" || class_id == undefined ? "" : class_id;
    queryFormat.unit_unit_id =
      unit_id == "" || unit_id == undefined ? "" : unit_id;
    const queryToString = helpers.queryToString(queryFormat);

    const resultSiswa = await studentModel.getAllSiswa(queryToString);
    console.log(queryFormat);
    const resultMonthly =
      await monthlyPaymentModel.getTagihanMonthlyPaymentAllStudentByPos(
        unit_id,
        class_id,
        period_id,
        payment_type
      );
    const resultFree =
      await freePaymentModel.getTagihanFreePaymentAllStudentByPos(
        unit_id,
        class_id,
        period_id,
        payment_type
      );

    const resultPeriod = period_id
      ? await periodModel.getTahunAjaranById(period_id)
      : "Semua";
    // const total = [...resultFree, ...resultMonthly].reduce(
    //   (accumulator, currentValue) => accumulator + parseInt(currentValue.payment_rate_bill, 10),
    //   0
    // );
    const newResult = {
      unit_name: `${unitResult.unit_name}  ${unitResult.unit_full_name}`,
      unit_address: unitResult.unit_address,
      unit_phone: unitResult.unit_phone,
      unit_person: unitResult.unit_person,
      unit_person_name: unitResult.unit_person_name,
      unit_person_nip: unitResult.unit_person_nip,
      unit_kota: unitResult.unit_kota,
      tahun_ajaran: resultPeriod.period_start
        ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
        : "Semua",
      title: `Laporan Pembayaran ${posPayType.pos_pay_name} ${unitResult.unit_name}`,
      class: classResult?.class_name ?? "Semua",
      students: resultSiswa.map((student) => ({
        ...student,
        total_tagihan:
          (parseInt(
            resultFree.filter(
              (item) => item.student_id == student.student_id
            )[0]?.payment_rate_bill,
            10
          ) || 0) +
          (resultMonthly
            .filter((item) => item.student_id == student.student_id)
            .reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.payment_rate_bill, 10),
              0
            ) || 0),
        result_free:
          parseInt(
            resultFree.filter(
              (item) => item.student_student_id == student.student_id
            )[0]?.payment_rate_bill,
            10
          ) || 0,
        result_month: resultMonthly
          .filter((item) => item.student_id == student.student_id)
          .reduce(
            (accumulator, currentValue) =>
              accumulator + parseInt(currentValue.payment_rate_bill, 10),
            0
          ),

        sisa_tagihan:
          (parseInt(
            resultFree.filter(
              (item) => item.student_id == student.student_id
            )[0]?.payment_rate_bebas_pay_remaining,
            10
          ) || 0) +
          (resultMonthly
            .filter(
              (item) =>
                item.student_id == student.student_id &&
                item.payment_rate_status == 0
            )
            .reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.payment_rate_bill, 10),
              0
            ) || 0),
        sudah_dibayar:
          (parseInt(
            resultFree.filter(
              (item) => item.student_id == student.student_id
            )[0]?.payment_rate_bill,
            10
          ) || 0) -
          (parseInt(
            resultFree.filter(
              (item) => item.student_id == student.student_id
            )[0]?.payment_rate_bebas_pay_remaining,
            10
          ) || 0) +
          (resultMonthly
            .filter(
              (item) =>
                item.student_id == student.student_id &&
                item.payment_rate_status == 1
            )
            .reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.payment_rate_bill, 10),
              0
            ) || 0),
      })),
    };
    const result = await generateDokumenLaporanPerKelas(
      "../assets/pdfTemplate/laporan/pembayaran-per-kelas.html",
      newResult
    );
    return helpers.response(
      res,
      200,
      "GET Data Laporan pembayaran per kelas berhasil",
      result
    );
  }),
  dokumenlaporanExcelPembayaranPerKelas: promiseHandler(
    async (req, res, next) => {
      const { unit_id, class_id, period_id, payment_type } = req.query;
      const posPayType = await posPayModel.getPosPayById(payment_type);
      const periodResult = await tahunAjaranModel.getTahunAjaranById(period_id);
      const unitResult = await unitModel.getUnitById(unit_id);
      let classResult = null;
      if (class_id !== "")
        classResult = await classModel.getKelasById(class_id);
      const queryFormat = {};
      console.log(class_id);
      // untuk penyesuaian query di sql
      queryFormat.class_class_id =
        class_id == "" || class_id == undefined ? "" : class_id;
      queryFormat.unit_unit_id =
        unit_id == "" || unit_id == undefined ? "" : unit_id;
      const queryToString = helpers.queryToString(queryFormat);

      const resultSiswa = await studentModel.getAllSiswa(queryToString);
      console.log(queryFormat);
      const resultMonthly =
        await monthlyPaymentModel.getTagihanMonthlyPaymentAllStudentByPos(
          unit_id,
          class_id,
          period_id,
          payment_type
        );
      const resultFree =
        await freePaymentModel.getTagihanFreePaymentAllStudentByPos(
          unit_id,
          class_id,
          period_id,
          payment_type
        );
      const resultPeriod = period_id
        ? await periodModel.getTahunAjaranById(period_id)
        : "Semua";

      // const total = [...resultFree, ...resultMonthly].reduce(
      //   (accumulator, currentValue) => accumulator + parseInt(currentValue.payment_rate_bill, 10),
      //   0
      // );
      const newResult = {
        unit_name: `${unitResult.unit_name}  ${unitResult.unit_full_name}`,
        unit_address: unitResult.unit_address,
        unit_phone: unitResult.unit_phone,
        tahun_ajaran: resultPeriod.period_start
          ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
          : "Semua",
        title: `Laporan Pembayaran ${posPayType.pos_pay_name} ${unitResult.unit_name}`,
        class: classResult?.class_name ?? "Semua",
        students: resultSiswa.map((student) => ({
          ...student,
          total_tagihan:
            (parseInt(
              resultFree.filter(
                (item) => item.student_id == student.student_id
              )[0]?.payment_rate_bill,
              10
            ) || 0) +
            (resultMonthly
              .filter((item) => item.student_id == student.student_id)
              .reduce(
                (accumulator, currentValue) =>
                  accumulator + parseInt(currentValue.payment_rate_bill, 10),
                0
              ) || 0),
          result_free:
            parseInt(
              resultFree.filter(
                (item) => item.student_student_id == student.student_id
              )[0]?.payment_rate_bill,
              10
            ) || 0,
          result_month: resultMonthly
            .filter((item) => item.student_id == student.student_id)
            .reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.payment_rate_bill, 10),
              0
            ),

          sisa_tagihan:
            (parseInt(
              resultFree.filter(
                (item) => item.student_id == student.student_id
              )[0]?.payment_rate_bebas_pay_remaining,
              10
            ) || 0) +
            (resultMonthly
              .filter(
                (item) =>
                  item.student_id == student.student_id &&
                  item.payment_rate_status == 0
              )
              .reduce(
                (accumulator, currentValue) =>
                  accumulator + parseInt(currentValue.payment_rate_bill, 10),
                0
              ) || 0),
          sudah_dibayar:
            (parseInt(
              resultFree.filter(
                (item) => item.student_id == student.student_id
              )[0]?.payment_rate_bill,
              10
            ) || 0) -
            (parseInt(
              resultFree.filter(
                (item) => item.student_id == student.student_id
              )[0]?.payment_rate_bebas_pay_remaining,
              10
            ) || 0) +
            (resultMonthly
              .filter(
                (item) =>
                  item.student_id == student.student_id &&
                  item.payment_rate_status == 1
              )
              .reduce(
                (accumulator, currentValue) =>
                  accumulator + parseInt(currentValue.payment_rate_bill, 10),
                0
              ) || 0),
        })),
      };
      const jsonData = newResult.students.map((student, index) => ({
        No: index + 1,
        NIS: student.student_nis,
        Nama: student.student_full_name,
        Tagihan: helpers.rupiahConvert(student.total_tagihan),
        "Sudah Dibayar": helpers.rupiahConvert(student.sudah_dibayar),
        Sisa: helpers.rupiahConvert(student.sisa_tagihan),
      }));

      const ws = XLSX.utils.json_to_sheet(jsonData, { origin: "A12" });

      // Add title in the first row

      // Create a new workbook and append the worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, newResult.title);

      // Add title in the first row
      // STEP 2: Create data rows and styles

      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: newResult.unit_name,
              t: "s",
              s: { font: { bold: true, color: "black", sz: 16 } },
            },
          ],
        ],
        {
          origin: "A1",
        }
      );

      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: newResult.unit_address,
              t: "s",
              s: { font: { bold: true, color: "black", sz: 13 } },
            },
          ],
        ],
        {
          origin: "A2",
        }
      );
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: newResult.title,
              t: "s",
              s: { font: { bold: true, color: "black", sz: 15 } },
            },
          ],
        ],
        {
          origin: "C5",
        }
      );

      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: "Tahun Ajaran",
              t: "s",
              s: { font: { bold: true, color: "black", sz: 12 } },
            },
          ],
        ],
        {
          origin: "A7",
        }
      );
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: newResult.tahun_ajaran,
              t: "s",
              s: { font: { bold: false, color: "black", sz: 12 } },
            },
          ],
        ],
        {
          origin: "B7",
        }
      );
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: "Kelas",
              t: "s",
              s: { font: { bold: true, color: "black", sz: 12 } },
            },
          ],
        ],
        {
          origin: "A8",
        }
      );
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: newResult.class,
              t: "s",
              s: { font: { bold: false, color: "black", sz: 12 } },
            },
          ],
        ],
        {
          origin: "B8",
        }
      );
      const addBorder = (cell) => {
        if (!cell.s) {
          cell.s = {};
        }
        cell.s.border = {
          top: { style: "medium", color: { auto: 1 } },
          bottom: { style: "medium", color: { auto: 1 } },
          left: { style: "medium", color: { auto: 1 } },
          right: { style: "medium", color: { auto: 1 } },
        };
      };
      const range = XLSX.utils.decode_range(ws["!ref"]);

      // Apply borders to each cell in the range, excluding the title row
      for (let R = 12; R <= range.e.r; ++R) {
        // Start from row 3 (index 2)
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell) addBorder(cell);
        }
      }

      const lastRow = range.e.r + 1; // Next row after the table
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: "Total Pembayaran Siswa",
              t: "s",
              s: {
                font: {
                  bold: true,
                  color: "black",
                  sz: 12,
                  fill: {
                    fgColor: { rgb: "FFFFAA00" },
                  },
                },
              },
            },
          ],
        ],
        { origin: `A${lastRow + 1}` } // Footer starts after the last row
      );
      const totalTagihan = newResult.students.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.sudah_dibayar || 0, 10),
        0
      );
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: helpers.rupiahConvert(totalTagihan || 0),
              t: "s",
              s: {
                font: {
                  bold: true,
                  color: "black",
                  sz: 12,
                  fill: {
                    fgColor: { rgb: "FFFFAA00" },
                  },
                },
              },
            },
          ],
        ],
        { origin: `E${lastRow + 1}` } // Footer starts after the last row
      );
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: `${unitResult.unit_kota}, ${moment()
                .locale("id")
                .format("DD MMMM YYYY")}`,
              t: "s",
              s: {
                font: {
                  bold: true,
                  color: "black",
                  sz: 12,
                  fill: {
                    fgColor: { rgb: "FFFFAA00" },
                  },
                },
              },
            },
          ],
        ],
        { origin: `E${lastRow + 3}` } // Footer starts after the last row
      );
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: unitResult.unit_person,
              t: "s",
              s: {
                font: {
                  bold: true,
                  color: "black",
                  sz: 12,
                  fill: {
                    fgColor: { rgb: "FFFFAA00" },
                  },
                },
              },
            },
          ],
        ],
        { origin: `F${lastRow + 4}` } // Footer starts after the last row
      );

      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            {
              v: unitResult.unit_person_name,
              t: "s",
              s: {
                font: {
                  bold: true,
                  color: "black",
                  sz: 12,
                  fill: {
                    fgColor: { rgb: "FFFFAA00" },
                  },
                },
              },
            },
          ],
        ],
        { origin: `F${lastRow + 8}` } // Footer starts after the last row
      );
      // Generate the Excel file and send it as a response
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      return helpers.response(
        res,
        200,
        "GET Data Laporan pembayaran per kelas berhasil",
        buffer
      );
    }
  ),
  dokumenlaporanPembayaranPerTanggal: promiseHandler(async (req, res, next) => {
    const {
      unit_id,
      class_id,
      period_id,
      payment_type,
      tanggal_awal,
      tanggal_akhir,
    } = req.query;
    const queryFormat = {};
    // untuk penyesuaian query di sql
    const posPayType = await posPayModel.getPosPayById(payment_type);
    const periodResult = await tahunAjaranModel.getTahunAjaranById(period_id);
    const unitResult = await unitModel.getUnitById(unit_id);
    let classResult = null;
    if (class_id !== "") classResult = await classModel.getKelasById(class_id);
    queryFormat.class_class_id =
      class_id == "" || class_id == undefined ? "" : class_id;
    queryFormat.unit_unit_id =
      unit_id == "" || unit_id == undefined ? "" : unit_id;
    // const queryToString = helpers.queryToString(queryFormat);

    const resultMonthly =
      await monthlyPaymentModel.getTagihanMonthlyPaymentAllStudentByPosWithDate(
        unit_id,
        class_id,
        period_id,
        tanggal_awal,
        tanggal_akhir
      );
    console.log(resultMonthly);
    const resultFree =
      await freePaymentModel.getTagihanFreePaymentAllStudentByPosWithDate(
        unit_id,
        class_id,
        period_id,
        tanggal_awal,
        tanggal_akhir
      );
    const query = `WHERE unit_unit_id=${unit_id} && period_period_id=${period_id}`;
    const resultPaymentType = await paymentTypeModel.getAllPaymentType(query);
    const resultPeriod = period_id
      ? await periodModel.getTahunAjaranById(period_id)
      : "Semua";
    const newResultPayment = {
      unit_name: `${unitResult.unit_name}  ${unitResult.unit_full_name}`,
      unit_address: unitResult.unit_address,
      unit_phone: unitResult.unit_phone,
      unit_person: unitResult.unit_person,
      unit_person_name: unitResult.unit_person_name,
      unit_person_nip: unitResult.unit_person_nip,
      unit_kota: unitResult.unit_kota,
      tahun_ajaran: resultPeriod.period_start
        ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
        : "Semua",

      title: `Laporan Pembayaran Tanggal ${tanggal_awal} s/d ${tanggal_akhir} `,
      class: classResult?.class_name ?? "Semua",
      tanggal_akhir,
      tanggal_awal,
      payment_type: resultPaymentType.map((item) => ({
        ...item,
        payment: [
          ...resultMonthly.filter(
            (itemMonthly) => item.payment_id == itemMonthly.payment_id
          ),
          ...resultFree.filter(
            (itemFree) => item.payment_id == itemFree.payment_id
          ),
        ],
        total:
          (resultFree
            .filter((itemFree) => item.payment_id == itemFree.payment_id)
            .reduce(
              (accumulator, currentValue) =>
                accumulator +
                parseFloat(currentValue.payment_rate_bebas_pay_bill, 10),
              0
            ) || 0) +
          (resultMonthly
            .filter((itemFree) => item.payment_id == itemFree.payment_id)
            .reduce(
              (accumulator, currentValue) =>
                accumulator + parseFloat(currentValue.payment_rate_bill, 10),
              0
            ) || 0),
      })),
    };
    const result = await generateDokumenLaporanPerTanggal(
      "../assets/pdfTemplate/laporan/pembayaran-per-tanggal.html",
      newResultPayment
    );
    return helpers.response(
      res,
      200,
      "GET Data Laporan pembayaran per kelas berhasil",
      result
    );
  }),
  dokumenlaporanExcelPembayaranPerTanggal: promiseHandler(
    async (req, res, next) => {
      const {
        unit_id,
        class_id,
        period_id,
        payment_type,
        tanggal_awal,
        tanggal_akhir,
      } = req.query;
      const queryFormat = {};
      // untuk penyesuaian query di sql
      const posPayType = await posPayModel.getPosPayById(payment_type);
      const periodResult = await tahunAjaranModel.getTahunAjaranById(period_id);
      const unitResult = await unitModel.getUnitById(unit_id);
      let classResult = null;
      if (class_id !== "")
        classResult = await classModel.getKelasById(class_id);
      queryFormat.class_class_id =
        class_id == "" || class_id == undefined ? "" : class_id;
      queryFormat.unit_unit_id =
        unit_id == "" || unit_id == undefined ? "" : unit_id;
      // const queryToString = helpers.queryToString(queryFormat);

      const resultMonthly =
        await monthlyPaymentModel.getTagihanMonthlyPaymentAllStudentByPosWithDate(
          unit_id,
          class_id,
          period_id,
          tanggal_awal,
          tanggal_akhir
        );
      console.log(resultMonthly);
      const resultFree =
        await freePaymentModel.getTagihanFreePaymentAllStudentByPosWithDate(
          unit_id,
          class_id,
          period_id,
          tanggal_awal,
          tanggal_akhir
        );
      const query = `WHERE unit_unit_id=${unit_id} && period_period_id=${period_id}`;
      const resultPaymentType = await paymentTypeModel.getAllPaymentType(query);
      const resultPeriod = period_id
        ? await periodModel.getTahunAjaranById(period_id)
        : "Semua";
      const newResultPayment = {
        unit_name: `${unitResult.unit_name}  ${unitResult.unit_full_name}`,
        unit_address: unitResult.unit_address,
        unit_phone: unitResult.unit_phone,
        unit_person: unitResult.unit_person,
        unit_person_name: unitResult.unit_person_name,
        unit_person_nip: unitResult.unit_person_nip,
        unit_kota: unitResult.unit_kota,
        tahun_ajaran: resultPeriod.period_start
          ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
          : "Semua",

        title: `Laporan Pembayaran Tanggal ${tanggal_awal} s/d ${tanggal_akhir} `,
        class: classResult?.class_name ?? "Semua",
        tanggal_akhir,
        tanggal_awal,
        payment_type: resultPaymentType.map((item) => ({
          ...item,
          payment: [
            ...resultMonthly.filter(
              (itemMonthly) => item.payment_id == itemMonthly.payment_id
            ),
            ...resultFree.filter(
              (itemFree) => item.payment_id == itemFree.payment_id
            ),
          ],
          total:
            (resultFree
              .filter((itemFree) => item.payment_id == itemFree.payment_id)
              .reduce(
                (accumulator, currentValue) =>
                  accumulator +
                  parseFloat(currentValue.payment_rate_bebas_pay_bill, 10),
                0
              ) || 0) +
            (resultMonthly
              .filter((itemFree) => item.payment_id == itemFree.payment_id)
              .reduce(
                (accumulator, currentValue) =>
                  accumulator + parseFloat(currentValue.payment_rate_bill, 10),
                0
              ) || 0),
        })),
      };
      const buffer = generateExcelLaporanPembayaranPerTanggal(newResultPayment);
      return helpers.response(
        res,
        200,
        "GET Data Laporan  Excel pembayaran per kelas berhasil",
        buffer
      );
    }
  ),
  dokumenLaporanKasBank: promiseHandler(async (req, res, next) => {
    const { tanggal_awal, tanggal_akhir, period_id, unit_id } = req.query;

    // semua data sampai sebelum tanggal_akhir
    const resultMonthlyPrev =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        true,
        "1-10102",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFreePrev = await freePaymentModel.getKasFreePaymentIdPayment(
      true,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKreditPrev = await kreditModel.getAllKreditSubmittedWithDate(
      true,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebitPrev = await debitModel.getAllDebitSubmittedWithDate(
      true,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArrPrev = [...resultKreditPrev, ...resultDebitPrev].reduce(
      (acc, cur) => {
        acc[cur.account_code]
          ? (acc[cur.account_code].total =
              parseInt(acc[cur.account_code].total || 0, 10) +
              parseInt(cur.total || 0, 10))
          : (acc[cur.account_code] = cur);
        acc[cur.account_code]
          ? (acc[cur.account_code].total_keluar =
              parseInt(acc[cur.account_code].total_keluar || 0, 10) +
              parseInt(cur.total_keluar || 0, 10))
          : (acc[cur.account_code] = cur);
        return acc;
      },
      {}
    );

    const queryPrev =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccountPrev = await cashAccountModel.getAllCashAccount(
      queryPrev
    );
    const newResultCashAccountPrev = {
      saldo_awal_debit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_debit, 10),
        0
      ),
      saldo_awal_kredit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResultPrev = [
      ...resultMonthlyPrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFreePrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArrPrev).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasukPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluarPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    console.log(resultMonthlyPrev);
    const saldoAkhirPrev =
      subTotalMasukPrev +
      newResultCashAccountPrev.saldo_awal_debit -
      (subTotalKeluarPrev + newResultCashAccountPrev.saldo_awal_kredit);

    // baru

    const resultMonthly =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        false,
        "1-10102",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFree = await freePaymentModel.getKasFreePaymentIdPayment(
      false,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKredit = await kreditModel.getAllKreditSubmittedWithDate(
      false,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebit = await debitModel.getAllDebitSubmittedWithDate(
      false,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArr = [...resultKredit, ...resultDebit].reduce((acc, cur) => {
      acc[cur.account_code]
        ? (acc[cur.account_code].total =
            parseInt(acc[cur.account_code].total || 0, 10) +
            parseInt(cur.total || 0, 10))
        : (acc[cur.account_code] = cur);
      acc[cur.account_code]
        ? (acc[cur.account_code].total_keluar =
            parseInt(acc[cur.account_code].total_keluar || 0, 10) +
            parseInt(cur.total_keluar || 0, 10))
        : (acc[cur.account_code] = cur);
      return acc;
    }, {});
    const query =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccount = await cashAccountModel.getAllCashAccount(query);
    const newResultCashAccount = {
      // saldo_awal_debit: resultCashAccount.reduce(
      //   (accumulator, currentValue) =>
      //     accumulator + parseInt(currentValue.cash_account_debit, 10),
      //   0
      // ),

      // pakai sebelumnya
      saldo_awal_debit: parseInt(saldoAkhirPrev || 0, 10) || 0,
      saldo_awal_kredit: resultCashAccount.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResult = [
      ...resultMonthly.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFree.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArr).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasuk = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluar = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    const resultUnit = await unitModel.getUnitById(unit_id);
    const resultPeriod = period_id
      ? await periodModel.getTahunAjaranById(period_id)
      : "Semua";
    const resultUnitUser = await unitModel.getUnitByUser(req.token.user_id);
    console.log(resultUnit);
    const newResult = {
      unit_name:
        unit_id !== ""
          ? `${resultUnit.unit_name}` + " " + `${resultUnit.unit_full_name}`
          : `${resultUnitUser[0].unit_full_name}`,
      unit_address:
        unit_id !== ""
          ? resultUnit.unit_address
          : resultUnitUser[0].unit_address,
      unit_phone:
        unit_id !== "" ? resultUnit.unit_phone : resultUnitUser[0].unit_phone,
      unit: unit_id == "" ? "Semua" : resultUnit.unit_name,
      unit_person:
        unit_id !== "" ? resultUnit.unit_person : resultUnitUser[0].unit_person,
      unit_person_name:
        unit_id !== ""
          ? resultUnit.unit_person_name
          : resultUnitUser[0].unit_person_name,
      unit_person_nip:
        unit_id !== ""
          ? resultUnit.unit_person_nip
          : resultUnitUser[0].unit_person_nip,
      unit_kota:
        unit_id !== "" ? resultUnit.unit_kota : resultUnitUser[0].unit_kota,
      tahun_ajaran: resultPeriod.period_start
        ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
        : "Semua",

      title: `Rekap Laporan (Kas Bank) per Tanggal ${moment(
        tanggal_awal
      ).format("DD MMMM YYYY")} Sampai ${moment(tanggal_akhir).format(
        "DD MMMM YYYY"
      )}`,
      data_payment: combinedResult,
      sub_total_masuk: subTotalMasuk,
      sub_total_keluar: subTotalKeluar,
      ...newResultCashAccount,
      total_masuk: subTotalMasuk + newResultCashAccount.saldo_awal_debit,
      total_keluar: subTotalKeluar + newResultCashAccount.saldo_awal_kredit,
      saldo_akhir:
        subTotalMasuk +
        newResultCashAccount.saldo_awal_debit -
        (subTotalKeluar + newResultCashAccount.saldo_awal_kredit),
    };

    const result = await generateDokumenLaporanKas(
      "../assets/pdfTemplate/laporan/laporan-kas.html",
      newResult
    );
    return helpers.response(res, 200, "GET Dokumen kas bank berhasil", result);
  }),
  dokumenLaporanExcelKasBank: promiseHandler(async (req, res, next) => {
    const { tanggal_awal, tanggal_akhir, period_id, unit_id } = req.query;

    // semua data sampai sebelum tanggal_akhir
    const resultMonthlyPrev =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        true,
        "1-10102",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFreePrev = await freePaymentModel.getKasFreePaymentIdPayment(
      true,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKreditPrev = await kreditModel.getAllKreditSubmittedWithDate(
      true,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebitPrev = await debitModel.getAllDebitSubmittedWithDate(
      true,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArrPrev = [...resultKreditPrev, ...resultDebitPrev].reduce(
      (acc, cur) => {
        acc[cur.account_code]
          ? (acc[cur.account_code].total =
              parseInt(acc[cur.account_code].total || 0, 10) +
              parseInt(cur.total || 0, 10))
          : (acc[cur.account_code] = cur);
        acc[cur.account_code]
          ? (acc[cur.account_code].total_keluar =
              parseInt(acc[cur.account_code].total_keluar || 0, 10) +
              parseInt(cur.total_keluar || 0, 10))
          : (acc[cur.account_code] = cur);
        return acc;
      },
      {}
    );

    const queryPrev =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccountPrev = await cashAccountModel.getAllCashAccount(
      queryPrev
    );
    const newResultCashAccountPrev = {
      saldo_awal_debit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_debit, 10),
        0
      ),
      saldo_awal_kredit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResultPrev = [
      ...resultMonthlyPrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFreePrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArrPrev).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasukPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluarPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    const saldoAkhirPrev =
      subTotalMasukPrev +
      newResultCashAccountPrev.saldo_awal_debit -
      (subTotalKeluarPrev + newResultCashAccountPrev.saldo_awal_kredit);

    // baru

    const resultMonthly =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        false,
        "1-10102",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFree = await freePaymentModel.getKasFreePaymentIdPayment(
      false,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKredit = await kreditModel.getAllKreditSubmittedWithDate(
      false,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebit = await debitModel.getAllDebitSubmittedWithDate(
      false,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArr = [...resultKredit, ...resultDebit].reduce((acc, cur) => {
      acc[cur.account_code]
        ? (acc[cur.account_code].total =
            parseInt(acc[cur.account_code].total || 0, 10) +
            parseInt(cur.total || 0, 10))
        : (acc[cur.account_code] = cur);
      acc[cur.account_code]
        ? (acc[cur.account_code].total_keluar =
            parseInt(acc[cur.account_code].total_keluar || 0, 10) +
            parseInt(cur.total_keluar || 0, 10))
        : (acc[cur.account_code] = cur);
      return acc;
    }, {});
    const query =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccount = await cashAccountModel.getAllCashAccount(query);
    const newResultCashAccount = {
      // saldo_awal_debit: resultCashAccount.reduce(
      //   (accumulator, currentValue) =>
      //     accumulator + parseInt(currentValue.cash_account_debit, 10),
      //   0
      // ),

      // pakai sebelumnya
      saldo_awal_debit: parseInt(saldoAkhirPrev || 0, 10) || 0,
      saldo_awal_kredit: resultCashAccount.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResult = [
      ...resultMonthly.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFree.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArr).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasuk = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluar = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    const resultUnit = await unitModel.getUnitById(unit_id);
    const resultUnitUser = await unitModel.getUnitByUser(req.token.user_id);
    const resultPeriod = period_id
      ? await periodModel.getTahunAjaranById(period_id)
      : "Semua";
    const newResult = {
      unit_name:
        unit_id !== ""
          ? `${resultUnit.unit_name}` + " " + `${resultUnit.unit_full_name}`
          : `${resultUnitUser[0].unit_full_name}`,
      unit_address:
        unit_id !== ""
          ? resultUnit.unit_address
          : resultUnitUser[0].unit_address,
      unit_phone:
        unit_id !== "" ? resultUnit.unit_phone : resultUnitUser[0].unit_phone,
      unit: unit_id == "" ? "Semua" : resultUnit.unit_name,
      unit_person:
        unit_id !== "" ? resultUnit.unit_person : resultUnitUser[0].unit_person,
      unit_person_name:
        unit_id !== ""
          ? resultUnit.unit_person_name
          : resultUnitUser[0].unit_person_name,
      unit_person_nip:
        unit_id !== ""
          ? resultUnit.unit_person_nip
          : resultUnitUser[0].unit_person_nip,
      unit_kota:
        unit_id !== "" ? resultUnit.unit_kota : resultUnitUser[0].unit_kota,
      tahun_ajaran: resultPeriod.period_start
        ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
        : "Semua",

      title: `Rekap Laporan (Kas Bank) per Tanggal ${moment(
        tanggal_awal
      ).format("DD MMMM YYYY")} Sampai ${moment(tanggal_akhir).format(
        "DD MMMM YYYY"
      )}`,
      data_payment: combinedResult,
      sub_total_masuk: subTotalMasuk,
      sub_total_keluar: subTotalKeluar,
      ...newResultCashAccount,
      total_masuk: subTotalMasuk + newResultCashAccount.saldo_awal_debit,
      total_keluar: subTotalKeluar + newResultCashAccount.saldo_awal_kredit,
      saldo_akhir:
        subTotalMasuk +
        newResultCashAccount.saldo_awal_debit -
        (subTotalKeluar + newResultCashAccount.saldo_awal_kredit),
    };

    // const result = await generateDokumenLaporanKas(
    //   "../assets/pdfTemplate/laporan/laporan-kas.html",
    //   newResult
    // );
    const buffer = generateExcelLaporanKasKeuangan(newResult);

    // Generate the Excel file and send it as a response
    return helpers.response(res, 200, "GET Dokumen kas bank berhasil", buffer);
  }),
  dokumenLaporanKasTunai: promiseHandler(async (req, res, next) => {
    const { tanggal_awal, tanggal_akhir, period_id, unit_id } = req.query;

    // semua data sampai sebelum tanggal_akhir
    const resultMonthlyPrev =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        true,
        "1-10101",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFreePrev = await freePaymentModel.getKasFreePaymentIdPayment(
      true,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKreditPrev = await kreditModel.getAllKreditSubmittedWithDate(
      true,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebitPrev = await debitModel.getAllDebitSubmittedWithDate(
      true,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArrPrev = [...resultKreditPrev, ...resultDebitPrev].reduce(
      (acc, cur) => {
        acc[cur.account_code]
          ? (acc[cur.account_code].total =
              parseInt(acc[cur.account_code].total || 0, 10) +
              parseInt(cur.total || 0, 10))
          : (acc[cur.account_code] = cur);
        acc[cur.account_code]
          ? (acc[cur.account_code].total_keluar =
              parseInt(acc[cur.account_code].total_keluar || 0, 10) +
              parseInt(cur.total_keluar || 0, 10))
          : (acc[cur.account_code] = cur);
        return acc;
      },
      {}
    );

    const queryPrev =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccountPrev = await cashAccountModel.getAllCashAccount(
      queryPrev
    );
    const newResultCashAccountPrev = {
      saldo_awal_debit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_debit, 10),
        0
      ),
      saldo_awal_kredit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResultPrev = [
      ...resultMonthlyPrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFreePrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArrPrev).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasukPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluarPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    console.log(resultMonthlyPrev);
    const saldoAkhirPrev =
      subTotalMasukPrev +
      newResultCashAccountPrev.saldo_awal_debit -
      (subTotalKeluarPrev + newResultCashAccountPrev.saldo_awal_kredit);

    // baru

    const resultMonthly =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        false,
        "1-10101",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFree = await freePaymentModel.getKasFreePaymentIdPayment(
      false,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKredit = await kreditModel.getAllKreditSubmittedWithDate(
      false,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebit = await debitModel.getAllDebitSubmittedWithDate(
      false,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArr = [...resultKredit, ...resultDebit].reduce((acc, cur) => {
      acc[cur.account_code]
        ? (acc[cur.account_code].total =
            parseInt(acc[cur.account_code].total || 0, 10) +
            parseInt(cur.total || 0, 10))
        : (acc[cur.account_code] = cur);
      acc[cur.account_code]
        ? (acc[cur.account_code].total_keluar =
            parseInt(acc[cur.account_code].total_keluar || 0, 10) +
            parseInt(cur.total_keluar || 0, 10))
        : (acc[cur.account_code] = cur);
      return acc;
    }, {});
    console.log(reducedArr);
    const query =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccount = await cashAccountModel.getAllCashAccount(query);
    const newResultCashAccount = {
      // saldo_awal_debit: resultCashAccount.reduce(
      //   (accumulator, currentValue) =>
      //     accumulator + parseInt(currentValue.cash_account_debit, 10),
      //   0
      // ),

      // pakai sebelumnya
      saldo_awal_debit: parseInt(saldoAkhirPrev || 0, 10) || 0,
      saldo_awal_kredit: resultCashAccount.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResult = [
      ...resultMonthly.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFree.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArr).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasuk = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluar = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );
    const resultUnit = await unitModel.getUnitById(unit_id);
    const resultPeriod = period_id
      ? await periodModel.getTahunAjaranById(period_id)
      : "Semua";

    const resultUnitUser = await unitModel.getUnitByUser(req.token.user_id);

    const newResult = {
      unit_name:
        unit_id !== ""
          ? `${resultUnit.unit_name}` + " " + `${resultUnit.unit_full_name}`
          : `${resultUnitUser[0].unit_full_name}`,
      unit_address:
        unit_id !== ""
          ? resultUnit.unit_address
          : resultUnitUser[0].unit_address,
      unit_phone:
        unit_id !== "" ? resultUnit.unit_phone : resultUnitUser[0].unit_phone,
      unit: unit_id == "" ? "Semua" : resultUnit.unit_name,
      unit_person:
        unit_id !== "" ? resultUnit.unit_person : resultUnitUser[0].unit_person,
      unit_person_name:
        unit_id !== ""
          ? resultUnit.unit_person_name
          : resultUnitUser[0].unit_person_name,
      unit_person_nip:
        unit_id !== ""
          ? resultUnit.unit_person_nip
          : resultUnitUser[0].unit_person_nip,
      unit_kota:
        unit_id !== "" ? resultUnit.unit_kota : resultUnitUser[0].unit_kota,
      tahun_ajaran: resultPeriod.period_start
        ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
        : "Semua",

      title: `Rekap Laporan (Kas Tunai) per Tanggal ${moment(
        tanggal_awal
      ).format("DD MMMM YYYY")} Sampai ${moment(tanggal_akhir).format(
        "DD MMMM YYYY"
      )}`,
      data_payment: combinedResult,
      sub_total_masuk: subTotalMasuk,
      sub_total_keluar: subTotalKeluar,
      ...newResultCashAccount,
      total_masuk: subTotalMasuk + newResultCashAccount.saldo_awal_debit,
      total_keluar: subTotalKeluar + newResultCashAccount.saldo_awal_kredit,
      saldo_akhir:
        subTotalMasuk +
        newResultCashAccount.saldo_awal_debit -
        (subTotalKeluar + newResultCashAccount.saldo_awal_kredit),
    };

    const result = await generateDokumenLaporanKas(
      "../assets/pdfTemplate/laporan/laporan-kas.html",
      newResult
    );
    return helpers.response(res, 200, "GET Laporan kas tunai berhasil", result);
  }),
  dokumenLaporanExcelKasTunai: promiseHandler(async (req, res, next) => {
    const { tanggal_awal, tanggal_akhir, period_id, unit_id } = req.query;

    // semua data sampai sebelum tanggal_akhir
    const resultMonthlyPrev =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        true,
        "1-10101",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFreePrev = await freePaymentModel.getKasFreePaymentIdPayment(
      true,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKreditPrev = await kreditModel.getAllKreditSubmittedWithDate(
      true,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebitPrev = await debitModel.getAllDebitSubmittedWithDate(
      true,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArrPrev = [...resultKreditPrev, ...resultDebitPrev].reduce(
      (acc, cur) => {
        acc[cur.account_code]
          ? (acc[cur.account_code].total =
              parseInt(acc[cur.account_code].total || 0, 10) +
              parseInt(cur.total || 0, 10))
          : (acc[cur.account_code] = cur);
        acc[cur.account_code]
          ? (acc[cur.account_code].total_keluar =
              parseInt(acc[cur.account_code].total_keluar || 0, 10) +
              parseInt(cur.total_keluar || 0, 10))
          : (acc[cur.account_code] = cur);
        return acc;
      },
      {}
    );

    const queryPrev =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccountPrev = await cashAccountModel.getAllCashAccount(
      queryPrev
    );
    const newResultCashAccountPrev = {
      saldo_awal_debit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_debit, 10),
        0
      ),
      saldo_awal_kredit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResultPrev = [
      ...resultMonthlyPrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFreePrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArrPrev).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasukPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluarPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    console.log(resultMonthlyPrev);
    const saldoAkhirPrev =
      subTotalMasukPrev +
      newResultCashAccountPrev.saldo_awal_debit -
      (subTotalKeluarPrev + newResultCashAccountPrev.saldo_awal_kredit);

    // baru

    const resultMonthly =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        false,
        "1-10101",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFree = await freePaymentModel.getKasFreePaymentIdPayment(
      false,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKredit = await kreditModel.getAllKreditSubmittedWithDate(
      false,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebit = await debitModel.getAllDebitSubmittedWithDate(
      false,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArr = [...resultKredit, ...resultDebit].reduce((acc, cur) => {
      acc[cur.account_code]
        ? (acc[cur.account_code].total =
            parseInt(acc[cur.account_code].total || 0, 10) +
            parseInt(cur.total || 0, 10))
        : (acc[cur.account_code] = cur);
      acc[cur.account_code]
        ? (acc[cur.account_code].total_keluar =
            parseInt(acc[cur.account_code].total_keluar || 0, 10) +
            parseInt(cur.total_keluar || 0, 10))
        : (acc[cur.account_code] = cur);
      return acc;
    }, {});
    console.log(reducedArr);
    const query =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccount = await cashAccountModel.getAllCashAccount(query);
    const newResultCashAccount = {
      // saldo_awal_debit: resultCashAccount.reduce(
      //   (accumulator, currentValue) =>
      //     accumulator + parseInt(currentValue.cash_account_debit, 10),
      //   0
      // ),

      // pakai sebelumnya
      saldo_awal_debit: parseInt(saldoAkhirPrev || 0, 10) || 0,
      saldo_awal_kredit: resultCashAccount.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResult = [
      ...resultMonthly.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFree.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArr).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasuk = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluar = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );
    const resultUnit = await unitModel.getUnitById(unit_id);
    const resultPeriod = period_id
      ? await periodModel.getTahunAjaranById(period_id)
      : "Semua";

    const resultUnitUser = await unitModel.getUnitByUser(req.token.user_id);

    const newResult = {
      unit_name:
        unit_id !== ""
          ? `${resultUnit.unit_name}` + " " + `${resultUnit.unit_full_name}`
          : `${resultUnitUser[0].unit_full_name}`,
      unit_address:
        unit_id !== ""
          ? resultUnit.unit_address
          : resultUnitUser[0].unit_address,
      unit_phone:
        unit_id !== "" ? resultUnit.unit_phone : resultUnitUser[0].unit_phone,
      unit: unit_id == "" ? "Semua" : resultUnit.unit_name,
      unit_person:
        unit_id !== "" ? resultUnit.unit_person : resultUnitUser[0].unit_person,
      unit_person_name:
        unit_id !== ""
          ? resultUnit.unit_person_name
          : resultUnitUser[0].unit_person_name,
      unit_person_nip:
        unit_id !== ""
          ? resultUnit.unit_person_nip
          : resultUnitUser[0].unit_person_nip,
      unit_kota:
        unit_id !== "" ? resultUnit.unit_kota : resultUnitUser[0].unit_kota,
      tahun_ajaran: resultPeriod.period_start
        ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
        : "Semua",

      title: `Rekap Laporan (Kas Tunai) per Tanggal ${moment(
        tanggal_awal
      ).format("DD MMMM YYYY")} Sampai ${moment(tanggal_akhir).format(
        "DD MMMM YYYY"
      )}`,
      data_payment: combinedResult,
      sub_total_masuk: subTotalMasuk,
      sub_total_keluar: subTotalKeluar,
      ...newResultCashAccount,
      total_masuk: subTotalMasuk + newResultCashAccount.saldo_awal_debit,
      total_keluar: subTotalKeluar + newResultCashAccount.saldo_awal_kredit,
      saldo_akhir:
        subTotalMasuk +
        newResultCashAccount.saldo_awal_debit -
        (subTotalKeluar + newResultCashAccount.saldo_awal_kredit),
    };
    const buffer = generateExcelLaporanKasKeuangan(newResult);

    return helpers.response(res, 200, "GET Laporan kas tunai berhasil", buffer);
  }),
  dokumenLaporanJurnalUmum: promiseHandler(async (req, res, next) => {
    const { tanggal_awal, tanggal_akhir, period_id, unit_id } = req.query;

    // semua data sampai sebelum tanggal_akhir
    const resultMonthlyPrev =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        true,
        "",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFreePrev = await freePaymentModel.getKasFreePaymentIdPayment(
      true,
      "",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKreditPrev = await kreditModel.getAllKreditSubmittedWithDate(
      true,
      "",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebitPrev = await debitModel.getAllDebitSubmittedWithDate(
      true,
      "",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArrPrev = [...resultKreditPrev, ...resultDebitPrev].reduce(
      (acc, cur) => {
        acc[cur.account_code]
          ? (acc[cur.account_code].total =
              parseInt(acc[cur.account_code].total || 0, 10) +
              parseInt(cur.total || 0, 10))
          : (acc[cur.account_code] = cur);
        acc[cur.account_code]
          ? (acc[cur.account_code].total_keluar =
              parseInt(acc[cur.account_code].total_keluar || 0, 10) +
              parseInt(cur.total_keluar || 0, 10))
          : (acc[cur.account_code] = cur);
        return acc;
      },
      {}
    );

    const queryPrev =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccountPrev = await cashAccountModel.getAllCashAccount(
      queryPrev
    );
    const newResultCashAccountPrev = {
      saldo_awal_debit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_debit, 10),
        0
      ),
      saldo_awal_kredit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResultPrev = [
      ...resultMonthlyPrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFreePrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArrPrev).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasukPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluarPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    console.log(resultMonthlyPrev);
    const saldoAkhirPrev =
      subTotalMasukPrev +
      newResultCashAccountPrev.saldo_awal_debit -
      (subTotalKeluarPrev + newResultCashAccountPrev.saldo_awal_kredit);

    // baru

    const resultMonthly =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        false,
        "",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFree = await freePaymentModel.getKasFreePaymentIdPayment(
      false,
      "",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKredit = await kreditModel.getAllKreditSubmittedWithDate(
      false,
      "",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebit = await debitModel.getAllDebitSubmittedWithDate(
      false,
      "",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArr = [...resultKredit, ...resultDebit].reduce((acc, cur) => {
      acc[cur.account_code]
        ? (acc[cur.account_code].total =
            parseInt(acc[cur.account_code].total || 0, 10) +
            parseInt(cur.total || 0, 10))
        : (acc[cur.account_code] = cur);
      acc[cur.account_code]
        ? (acc[cur.account_code].total_keluar =
            parseInt(acc[cur.account_code].total_keluar || 0, 10) +
            parseInt(cur.total_keluar || 0, 10))
        : (acc[cur.account_code] = cur);
      return acc;
    }, {});
    console.log(reducedArr);
    const query =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccount = await cashAccountModel.getAllCashAccount(query);
    const newResultCashAccount = {
      // saldo_awal_debit: resultCashAccount.reduce(
      //   (accumulator, currentValue) =>
      //     accumulator + parseInt(currentValue.cash_account_debit, 10),
      //   0
      // ),

      // pakai sebelumnya
      saldo_awal_debit: parseInt(saldoAkhirPrev || 0, 10) || 0,
      saldo_awal_kredit: resultCashAccount.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResult = [
      ...resultMonthly.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFree.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArr).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasuk = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluar = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );
    const resultUnit = await unitModel.getUnitById(unit_id);
    const resultPeriod = period_id
      ? await periodModel.getTahunAjaranById(period_id)
      : "Semua";

    const resultUnitUser = await unitModel.getUnitByUser(req.token.user_id);

    const newResult = {
      unit_name:
        unit_id !== ""
          ? `${resultUnit.unit_name}` + " " + `${resultUnit.unit_full_name}`
          : `${resultUnitUser[0].unit_full_name}`,
      unit_address:
        unit_id !== ""
          ? resultUnit.unit_address
          : resultUnitUser[0].unit_address,
      unit_phone:
        unit_id !== "" ? resultUnit.unit_phone : resultUnitUser[0].unit_phone,
      unit_person:
        unit_id !== "" ? resultUnit.unit_person : resultUnitUser[0].unit_person,
      unit_person_name:
        unit_id !== ""
          ? resultUnit.unit_person_name
          : resultUnitUser[0].unit_person_name,
      unit_person_nip:
        unit_id !== ""
          ? resultUnit.unit_person_nip
          : resultUnitUser[0].unit_person_nip,
      unit_kota:
        unit_id !== "" ? resultUnit.unit_kota : resultUnitUser[0].unit_kota,
      unit: unit_id == "" ? "Semua" : resultUnit.unit_name,
      tahun_ajaran: resultPeriod.period_start
        ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
        : "Semua",

      title: `Rekap Laporan Jurnal per Tanggal ${moment(tanggal_awal).format(
        "DD MMMM YYYY"
      )} Sampai ${moment(tanggal_akhir).format("DD MMMM YYYY")}`,
      data_payment: combinedResult,
      sub_total_masuk: subTotalMasuk,
      sub_total_keluar: subTotalKeluar,
      ...newResultCashAccount,
      total_masuk: subTotalMasuk + newResultCashAccount.saldo_awal_debit,
      total_keluar: subTotalKeluar + newResultCashAccount.saldo_awal_kredit,
      saldo_akhir:
        subTotalMasuk +
        newResultCashAccount.saldo_awal_debit -
        (subTotalKeluar + newResultCashAccount.saldo_awal_kredit),
    };

    const result = await generateDokumenJurnalUmum(
      "../assets/pdfTemplate/laporan/laporan-jurnal-umum.html",
      newResult
    );
    return helpers.response(
      res,
      200,
      "GET Dokumen Jurnal Umum berhasil",
      result
    );
  }),
  dokumenLaporanExcelJurnalUmum: promiseHandler(async (req, res, next) => {
    const { tanggal_awal, tanggal_akhir, period_id, unit_id } = req.query;

    // semua data sampai sebelum tanggal_akhir
    const resultMonthlyPrev =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        true,
        "",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFreePrev = await freePaymentModel.getKasFreePaymentIdPayment(
      true,
      "",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKreditPrev = await kreditModel.getAllKreditSubmittedWithDate(
      true,
      "",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebitPrev = await debitModel.getAllDebitSubmittedWithDate(
      true,
      "",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArrPrev = [...resultKreditPrev, ...resultDebitPrev].reduce(
      (acc, cur) => {
        acc[cur.account_code]
          ? (acc[cur.account_code].total =
              parseInt(acc[cur.account_code].total || 0, 10) +
              parseInt(cur.total || 0, 10))
          : (acc[cur.account_code] = cur);
        acc[cur.account_code]
          ? (acc[cur.account_code].total_keluar =
              parseInt(acc[cur.account_code].total_keluar || 0, 10) +
              parseInt(cur.total_keluar || 0, 10))
          : (acc[cur.account_code] = cur);
        return acc;
      },
      {}
    );

    const queryPrev =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccountPrev = await cashAccountModel.getAllCashAccount(
      queryPrev
    );
    const newResultCashAccountPrev = {
      saldo_awal_debit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_debit, 10),
        0
      ),
      saldo_awal_kredit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResultPrev = [
      ...resultMonthlyPrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFreePrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArrPrev).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasukPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluarPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    console.log(resultMonthlyPrev);
    const saldoAkhirPrev =
      subTotalMasukPrev +
      newResultCashAccountPrev.saldo_awal_debit -
      (subTotalKeluarPrev + newResultCashAccountPrev.saldo_awal_kredit);

    // baru

    const resultMonthly =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        false,
        "",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFree = await freePaymentModel.getKasFreePaymentIdPayment(
      false,
      "",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKredit = await kreditModel.getAllKreditSubmittedWithDate(
      false,
      "",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebit = await debitModel.getAllDebitSubmittedWithDate(
      false,
      "",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArr = [...resultKredit, ...resultDebit].reduce((acc, cur) => {
      acc[cur.account_code]
        ? (acc[cur.account_code].total =
            parseInt(acc[cur.account_code].total || 0, 10) +
            parseInt(cur.total || 0, 10))
        : (acc[cur.account_code] = cur);
      acc[cur.account_code]
        ? (acc[cur.account_code].total_keluar =
            parseInt(acc[cur.account_code].total_keluar || 0, 10) +
            parseInt(cur.total_keluar || 0, 10))
        : (acc[cur.account_code] = cur);
      return acc;
    }, {});
    console.log(reducedArr);
    const query =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccount = await cashAccountModel.getAllCashAccount(query);
    const newResultCashAccount = {
      // saldo_awal_debit: resultCashAccount.reduce(
      //   (accumulator, currentValue) =>
      //     accumulator + parseInt(currentValue.cash_account_debit, 10),
      //   0
      // ),

      // pakai sebelumnya
      saldo_awal_debit: parseInt(saldoAkhirPrev || 0, 10) || 0,
      saldo_awal_kredit: resultCashAccount.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResult = [
      ...resultMonthly.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFree.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArr).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasuk = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluar = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );
    const resultUnit = await unitModel.getUnitById(unit_id);
    const resultPeriod = period_id
      ? await periodModel.getTahunAjaranById(period_id)
      : "Semua";

    const resultUnitUser = await unitModel.getUnitByUser(req.token.user_id);

    const newResult = {
      unit_name:
        unit_id !== ""
          ? `${resultUnit.unit_name}` + " " + `${resultUnit.unit_full_name}`
          : `${resultUnitUser[0].unit_full_name}`,
      unit_address:
        unit_id !== ""
          ? resultUnit.unit_address
          : resultUnitUser[0].unit_address,
      unit_phone:
        unit_id !== "" ? resultUnit.unit_phone : resultUnitUser[0].unit_phone,
      unit: unit_id == "" ? "Semua" : resultUnit.unit_name,
      unit_person:
        unit_id !== "" ? resultUnit.unit_person : resultUnitUser[0].unit_person,
      unit_person_name:
        unit_id !== ""
          ? resultUnit.unit_person_name
          : resultUnitUser[0].unit_person_name,
      unit_person_nip:
        unit_id !== ""
          ? resultUnit.unit_person_nip
          : resultUnitUser[0].unit_person_nip,
      unit_kota:
        unit_id !== "" ? resultUnit.unit_kota : resultUnitUser[0].unit_kota,
      tahun_ajaran: resultPeriod.period_start
        ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
        : "Semua",

      title: `Rekap Laporan Jurnal per Tanggal ${moment(tanggal_awal).format(
        "DD MMMM YYYY"
      )} Sampai ${moment(tanggal_akhir).format("DD MMMM YYYY")}`,
      data_payment: combinedResult,
      sub_total_masuk: subTotalMasuk,
      sub_total_keluar: subTotalKeluar,
      ...newResultCashAccount,
      total_masuk: subTotalMasuk + newResultCashAccount.saldo_awal_debit,
      total_keluar: subTotalKeluar + newResultCashAccount.saldo_awal_kredit,
      saldo_akhir:
        subTotalMasuk +
        newResultCashAccount.saldo_awal_debit -
        (subTotalKeluar + newResultCashAccount.saldo_awal_kredit),
    };
    console.log(newResult);
    console.log("sini");
    const buffer = generateExcelLaporanKasKeuangan(newResult);

    return helpers.response(
      res,
      200,
      "GET Dokumen Excel Jurnal Umum berhasil",
      buffer
    );
  }),

  dokumenLaporanKasBankPerAnggaran: promiseHandler(async (req, res, next) => {
    const { tanggal_awal, tanggal_akhir, period_id, unit_id } = req.query;

    // semua data sampai sebelum tanggal_akhir
    const resultMonthlyPrev =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        true,
        "1-10102",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFreePrev = await freePaymentModel.getKasFreePaymentIdPayment(
      true,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKreditPrev = await kreditModel.getAllKreditSubmittedWithDate(
      true,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebitPrev = await debitModel.getAllDebitSubmittedWithDate(
      true,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArrPrev = [...resultKreditPrev, ...resultDebitPrev].reduce(
      (acc, cur) => {
        acc[cur.account_code]
          ? (acc[cur.account_code].total =
              parseInt(acc[cur.account_code].total || 0, 10) +
              parseInt(cur.total || 0, 10))
          : (acc[cur.account_code] = cur);
        acc[cur.account_code]
          ? (acc[cur.account_code].total_keluar =
              parseInt(acc[cur.account_code].total_keluar || 0, 10) +
              parseInt(cur.total_keluar || 0, 10))
          : (acc[cur.account_code] = cur);
        return acc;
      },
      {}
    );

    const queryPrev =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccountPrev = await cashAccountModel.getAllCashAccount(
      queryPrev
    );
    const newResultCashAccountPrev = {
      saldo_awal_debit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_debit, 10),
        0
      ),
      saldo_awal_kredit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResultPrev = [
      ...resultMonthlyPrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFreePrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArrPrev).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasukPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluarPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    console.log(resultMonthlyPrev);
    const saldoAkhirPrev =
      subTotalMasukPrev +
      newResultCashAccountPrev.saldo_awal_debit -
      (subTotalKeluarPrev + newResultCashAccountPrev.saldo_awal_kredit);

    // baru

    const resultMonthly =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        false,
        "1-10102",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFree = await freePaymentModel.getKasFreePaymentIdPayment(
      false,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKredit = await kreditModel.getAllKreditSubmittedWithDate(
      false,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebit = await debitModel.getAllDebitSubmittedWithDate(
      false,
      "1-10102",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArr = [...resultKredit, ...resultDebit].reduce((acc, cur) => {
      acc[cur.account_code]
        ? (acc[cur.account_code].total =
            parseInt(acc[cur.account_code].total, 10) +
            parseInt(cur.total || 0, 10))
        : (acc[cur.account_code] = cur);
      acc[cur.account_code]
        ? (acc[cur.account_code].total_keluar =
            parseInt(acc[cur.account_code].total_keluar || 0, 10) +
              parseInt(cur.total_keluar || 0, 10) || 0)
        : (acc[cur.account_code] = cur);
      return acc;
    }, {});
    const query =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccount = await cashAccountModel.getAllCashAccount(query);
    const newResultCashAccount = {
      // saldo_awal_debit: resultCashAccount.reduce(
      //   (accumulator, currentValue) =>
      //     accumulator + parseInt(currentValue.cash_account_debit, 10),
      //   0
      // ),

      // pakai sebelumnya
      saldo_awal_debit: parseInt(saldoAkhirPrev || 0, 10) || 0,
      saldo_awal_kredit: resultCashAccount.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResult = [
      ...resultMonthly.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFree.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArr).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasuk = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluar = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    const resultUnit = await unitModel.getUnitById(unit_id);
    const resultPeriod = period_id
      ? await periodModel.getTahunAjaranById(period_id)
      : "Semua";

    const resultUnitUser = await unitModel.getUnitByUser(req.token.user_id);

    const newResult = {
      unit_name:
        unit_id !== ""
          ? `${resultUnit.unit_name}` + " " + `${resultUnit.unit_full_name}`
          : `${resultUnitUser[0].unit_full_name}`,
      unit_address:
        unit_id !== ""
          ? resultUnit.unit_address
          : resultUnitUser[0].unit_address,
      unit_phone:
        unit_id !== "" ? resultUnit.unit_phone : resultUnitUser[0].unit_phone,
      unit_person:
        unit_id !== "" ? resultUnit.unit_person : resultUnitUser[0].unit_person,
      unit_person_name:
        unit_id !== ""
          ? resultUnit.unit_person_name
          : resultUnitUser[0].unit_person_name,
      unit_person_nip:
        unit_id !== ""
          ? resultUnit.unit_person_nip
          : resultUnitUser[0].unit_person_nip,
      unit_kota:
        unit_id !== "" ? resultUnit.unit_kota : resultUnitUser[0].unit_kota,
      unit: unit_id == "" ? "Semua" : resultUnit.unit_name,
      tahun_ajaran: resultPeriod.period_start
        ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
        : "Semua",

      title: `Rekap Laporan per Jenis Anggaran (Kas Bank) per Tanggal ${moment(
        tanggal_awal
      ).format("DD MMMM YYYY")} Sampai ${moment(tanggal_akhir).format(
        "DD MMMM YYYY"
      )}`,
      data_payment: combinedResult,
      sub_total_masuk: subTotalMasuk,
      sub_total_keluar: subTotalKeluar,
      ...newResultCashAccount,
      total_masuk: subTotalMasuk + newResultCashAccount.saldo_awal_debit,
      total_keluar: subTotalKeluar + newResultCashAccount.saldo_awal_kredit,
      saldo_akhir:
        subTotalMasuk +
        newResultCashAccount.saldo_awal_debit -
        (subTotalKeluar + newResultCashAccount.saldo_awal_kredit),
    };
    const accountCodeArr = helpers.extractUniqueAccountCodes(newResult);
    console.log(accountCodeArr);
    const newResultByAccountCode = accountCodeArr.map((item) => {
      const dataFilteredDebit = newResult.data_payment.filter(
        (itemFilter) =>
          itemFilter.account_code == item &&
          (itemFilter.account_cost_account_code.includes("4-4") ||
            itemFilter.account_code.includes("4-4"))
      );
      const dataFilteredKredit = newResult.data_payment.filter(
        (itemFilter) =>
          itemFilter.account_code == item &&
          (itemFilter.account_cost_account_code.includes("5-5") ||
            itemFilter.account_code.includes("5-5"))
      );
      return {
        code: item,
        description: resultCashAccount.filter(
          (itemAccount) => itemAccount.account_code == item
        )[0].account_description,
        data_payment: {
          debit: {
            data: dataFilteredDebit,
            sub_total_masuk: dataFilteredDebit.reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.total || 0, 10),
              0
            ),
            sub_total_keluar: dataFilteredDebit.reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.total_keluar || 0, 10),
              0
            ),
          },
          kredit: {
            data: dataFilteredKredit,
            sub_total_masuk: dataFilteredKredit.reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.total || 0, 10),
              0
            ),
            sub_total_keluar: dataFilteredKredit.reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.total_keluar || 0, 10),
              0
            ),
          },
        },
        total: newResult.data_payment
          .filter((itemFilter) => itemFilter.account_code == item)
          ?.reduce(
            (accumulator, currentValue) =>
              accumulator + parseFloat(currentValue.total || 0, 10),
            0
          ),
        total_keluar: newResult.data_payment
          .filter((itemFilter) => itemFilter.account_code == item)
          ?.reduce(
            (accumulator, currentValue) =>
              accumulator + parseFloat(currentValue.total_keluar || 0, 10),
            0
          ),
      };
    });
    const result = await generateDokumenLaporanKasPerAnggaran(
      "../assets/pdfTemplate/laporan/laporan-kas-per-anggaran.html",
      newResult,
      newResultByAccountCode
    );
    return helpers.response(res, 200, "GET Dokumen kas bank berhasil", result);
  }),
  dokumenLaporanKasTunaiPerAnggaran: promiseHandler(async (req, res, next) => {
    const { tanggal_awal, tanggal_akhir, period_id, unit_id } = req.query;

    // semua data sampai sebelum tanggal_akhir
    const resultMonthlyPrev =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        true,
        "1-10101",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFreePrev = await freePaymentModel.getKasFreePaymentIdPayment(
      true,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKreditPrev = await kreditModel.getAllKreditSubmittedWithDate(
      true,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebitPrev = await debitModel.getAllDebitSubmittedWithDate(
      true,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArrPrev = [...resultKreditPrev, ...resultDebitPrev].reduce(
      (acc, cur) => {
        acc[cur.account_code]
          ? (acc[cur.account_code].total =
              parseInt(acc[cur.account_code].total || 0, 10) +
              parseInt(cur.total || 0, 10))
          : (acc[cur.account_code] = cur);
        acc[cur.account_code]
          ? (acc[cur.account_code].total_keluar =
              parseInt(acc[cur.account_code].total_keluar || 0, 10) +
              parseInt(cur.total_keluar || 0, 10))
          : (acc[cur.account_code] = cur);
        return acc;
      },
      {}
    );

    const queryPrev =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccountPrev = await cashAccountModel.getAllCashAccount(
      queryPrev
    );
    const newResultCashAccountPrev = {
      saldo_awal_debit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_debit, 10),
        0
      ),
      saldo_awal_kredit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResultPrev = [
      ...resultMonthlyPrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFreePrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArrPrev).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasukPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluarPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    console.log(resultMonthlyPrev);
    const saldoAkhirPrev =
      subTotalMasukPrev +
      newResultCashAccountPrev.saldo_awal_debit -
      (subTotalKeluarPrev + newResultCashAccountPrev.saldo_awal_kredit);

    // baru

    const resultMonthly =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        false,
        "1-10101",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFree = await freePaymentModel.getKasFreePaymentIdPayment(
      false,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKredit = await kreditModel.getAllKreditSubmittedWithDate(
      false,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebit = await debitModel.getAllDebitSubmittedWithDate(
      false,
      "1-10101",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArr = [...resultKredit, ...resultDebit].reduce((acc, cur) => {
      acc[cur.account_code]
        ? (acc[cur.account_code].total =
            parseInt(acc[cur.account_code].total, 10) +
            parseInt(cur.total || 0, 10))
        : (acc[cur.account_code] = cur);
      acc[cur.account_code]
        ? (acc[cur.account_code].total_keluar =
            parseInt(acc[cur.account_code].total_keluar || 0, 10) +
              parseInt(cur.total_keluar || 0, 10) || 0)
        : (acc[cur.account_code] = cur);
      return acc;
    }, {});
    const query =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccount = await cashAccountModel.getAllCashAccount(query);
    const newResultCashAccount = {
      // saldo_awal_debit: resultCashAccount.reduce(
      //   (accumulator, currentValue) =>
      //     accumulator + parseInt(currentValue.cash_account_debit, 10),
      //   0
      // ),

      // pakai sebelumnya
      saldo_awal_debit: parseInt(saldoAkhirPrev || 0, 10) || 0,
      saldo_awal_kredit: resultCashAccount.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResult = [
      ...resultMonthly.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFree.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArr).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasuk = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluar = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    const resultUnit = await unitModel.getUnitById(unit_id);
    const resultPeriod = period_id
      ? await periodModel.getTahunAjaranById(period_id)
      : "Semua";

    const resultUnitUser = await unitModel.getUnitByUser(req.token.user_id);

    const newResult = {
      unit_name:
        unit_id !== ""
          ? `${resultUnit.unit_name}` + " " + `${resultUnit.unit_full_name}`
          : `${resultUnitUser[0].unit_full_name}`,
      unit_address:
        unit_id !== ""
          ? resultUnit.unit_address
          : resultUnitUser[0].unit_address,
      unit_phone:
        unit_id !== "" ? resultUnit.unit_phone : resultUnitUser[0].unit_phone,
      unit_person:
        unit_id !== "" ? resultUnit.unit_person : resultUnitUser[0].unit_person,
      unit_person_name:
        unit_id !== ""
          ? resultUnit.unit_person_name
          : resultUnitUser[0].unit_person_name,
      unit_person_nip:
        unit_id !== ""
          ? resultUnit.unit_person_nip
          : resultUnitUser[0].unit_person_nip,
      unit_kota:
        unit_id !== "" ? resultUnit.unit_kota : resultUnitUser[0].unit_kota,
      unit: unit_id == "" ? "Semua" : resultUnit.unit_name,
      tahun_ajaran: resultPeriod.period_start
        ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
        : "Semua",

      title: `Rekap Laporan per Jenis Anggaran (Kas Bank) per Tanggal ${moment(
        tanggal_awal
      ).format("DD MMMM YYYY")} Sampai ${moment(tanggal_akhir).format(
        "DD MMMM YYYY"
      )}`,
      data_payment: combinedResult,
      sub_total_masuk: subTotalMasuk,
      sub_total_keluar: subTotalKeluar,
      ...newResultCashAccount,
      total_masuk: subTotalMasuk + newResultCashAccount.saldo_awal_debit,
      total_keluar: subTotalKeluar + newResultCashAccount.saldo_awal_kredit,
      saldo_akhir:
        subTotalMasuk +
        newResultCashAccount.saldo_awal_debit -
        (subTotalKeluar + newResultCashAccount.saldo_awal_kredit),
    };
    const accountCodeArr = helpers.extractUniqueAccountCodes(newResult);
    console.log(accountCodeArr);
    const newResultByAccountCode = accountCodeArr.map((item) => {
      const dataFilteredDebit = newResult.data_payment.filter(
        (itemFilter) =>
          itemFilter.account_code == item &&
          (itemFilter.account_cost_account_code.includes("4-4") ||
            itemFilter.account_code.includes("4-4"))
      );
      const dataFilteredKredit = newResult.data_payment.filter(
        (itemFilter) =>
          itemFilter.account_code == item &&
          (itemFilter.account_cost_account_code.includes("5-5") ||
            itemFilter.account_code.includes("5-5"))
      );
      return {
        code: item,
        description: resultCashAccount.filter(
          (itemAccount) => itemAccount.account_code == item
        )[0].account_description,
        data_payment: {
          debit: {
            data: dataFilteredDebit,
            sub_total_masuk: dataFilteredDebit.reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.total || 0, 10),
              0
            ),
            sub_total_keluar: dataFilteredDebit.reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.total_keluar || 0, 10),
              0
            ),
          },
          kredit: {
            data: dataFilteredKredit,
            sub_total_masuk: dataFilteredKredit.reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.total || 0, 10),
              0
            ),
            sub_total_keluar: dataFilteredKredit.reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.total_keluar || 0, 10),
              0
            ),
          },
        },
        total: newResult.data_payment
          .filter((itemFilter) => itemFilter.account_code == item)
          ?.reduce(
            (accumulator, currentValue) =>
              accumulator + parseFloat(currentValue.total || 0, 10),
            0
          ),
        total_keluar: newResult.data_payment
          .filter((itemFilter) => itemFilter.account_code == item)
          ?.reduce(
            (accumulator, currentValue) =>
              accumulator + parseFloat(currentValue.total_keluar || 0, 10),
            0
          ),
      };
    });
    const result = await generateDokumenLaporanKasPerAnggaran(
      "../assets/pdfTemplate/laporan/laporan-kas-per-anggaran.html",
      newResult,
      newResultByAccountCode
    );
    return helpers.response(
      res,
      200,
      "GET Dokumen Per anggaran kas tunai berhasil",
      result
    );
  }),
  dokumenLaporanJurnalPerAnggaran: promiseHandler(async (req, res, _next) => {
    const { tanggal_awal, tanggal_akhir, period_id, unit_id } = req.query;

    // semua data sampai sebelum tanggal_akhir
    const resultMonthlyPrev =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        true,
        "",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFreePrev = await freePaymentModel.getKasFreePaymentIdPayment(
      true,
      "",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKreditPrev = await kreditModel.getAllKreditSubmittedWithDate(
      true,
      "",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebitPrev = await debitModel.getAllDebitSubmittedWithDate(
      true,
      "",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArrPrev = [...resultKreditPrev, ...resultDebitPrev].reduce(
      (acc, cur) => {
        acc[cur.account_code]
          ? (acc[cur.account_code].total =
              parseInt(acc[cur.account_code].total || 0, 10) +
              parseInt(cur.total || 0, 10))
          : (acc[cur.account_code] = cur);
        acc[cur.account_code]
          ? (acc[cur.account_code].total_keluar =
              parseInt(acc[cur.account_code].total_keluar || 0, 10) +
              parseInt(cur.total_keluar || 0, 10))
          : (acc[cur.account_code] = cur);
        return acc;
      },
      {}
    );

    const queryPrev =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccountPrev = await cashAccountModel.getAllCashAccount(
      queryPrev
    );
    const newResultCashAccountPrev = {
      saldo_awal_debit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_debit, 10),
        0
      ),
      saldo_awal_kredit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResultPrev = [
      ...resultMonthlyPrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFreePrev.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArrPrev).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasukPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluarPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    console.log(resultMonthlyPrev);
    const saldoAkhirPrev =
      subTotalMasukPrev +
      newResultCashAccountPrev.saldo_awal_debit -
      (subTotalKeluarPrev + newResultCashAccountPrev.saldo_awal_kredit);

    // baru

    const resultMonthly =
      await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
        false,
        "",
        tanggal_awal,
        tanggal_akhir,
        period_id,
        unit_id
      );
    const resultFree = await freePaymentModel.getKasFreePaymentIdPayment(
      false,
      "",
      tanggal_awal,
      tanggal_akhir,
      period_id,
      unit_id
    );
    const resultKredit = await kreditModel.getAllKreditSubmittedWithDate(
      false,
      "",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );
    const resultDebit = await debitModel.getAllDebitSubmittedWithDate(
      false,
      "",
      tanggal_awal,
      tanggal_akhir,
      unit_id
    );

    const reducedArr = [...resultKredit, ...resultDebit].reduce((acc, cur) => {
      acc[cur.account_code]
        ? (acc[cur.account_code].total =
            parseInt(acc[cur.account_code].total, 10) +
            parseInt(cur.total || 0, 10))
        : (acc[cur.account_code] = cur);
      acc[cur.account_code]
        ? (acc[cur.account_code].total_keluar =
            parseInt(acc[cur.account_code].total_keluar || 0, 10) +
              parseInt(cur.total_keluar || 0, 10) || 0)
        : (acc[cur.account_code] = cur);
      return acc;
    }, {});
    const query =
      unit_id == undefined || unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccount = await cashAccountModel.getAllCashAccount(query);
    const newResultCashAccount = {
      // saldo_awal_debit: resultCashAccount.reduce(
      //   (accumulator, currentValue) =>
      //     accumulator + parseInt(currentValue.cash_account_debit, 10),
      //   0
      // ),

      // pakai sebelumnya
      saldo_awal_debit: parseInt(saldoAkhirPrev || 0, 10) || 0,
      saldo_awal_kredit: resultCashAccount.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.cash_account_kredit, 10),
        0
      ),
    };
    const combinedResult = [
      ...resultMonthly.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...resultFree.map((item) => ({
        ...item,
        date_pay: item.payment_rate_date_pay,
      })),
      ...Object.values(reducedArr).map((item) => ({
        ...item,
        date_pay: item.kredit_date,
      })),
    ];
    const subTotalMasuk = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluar = combinedResult.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    const resultUnit = await unitModel.getUnitById(unit_id);
    const resultPeriod = period_id
      ? await periodModel.getTahunAjaranById(period_id)
      : "Semua";

    const resultUnitUser = await unitModel.getUnitByUser(req.token.user_id);

    const newResult = {
      unit_name:
        unit_id !== ""
          ? `${resultUnit.unit_name}` + " " + `${resultUnit.unit_full_name}`
          : `${resultUnitUser[0].unit_full_name}`,
      unit_address:
        unit_id !== ""
          ? resultUnit.unit_address
          : resultUnitUser[0].unit_address,
      unit_phone:
        unit_id !== "" ? resultUnit.unit_phone : resultUnitUser[0].unit_phone,
      unit_person:
        unit_id !== "" ? resultUnit.unit_person : resultUnitUser[0].unit_person,
      unit_person_name:
        unit_id !== ""
          ? resultUnit.unit_person_name
          : resultUnitUser[0].unit_person_name,
      unit_person_nip:
        unit_id !== ""
          ? resultUnit.unit_person_nip
          : resultUnitUser[0].unit_person_nip,
      unit_kota:
        unit_id !== "" ? resultUnit.unit_kota : resultUnitUser[0].unit_kota,
      unit: unit_id == "" ? "Semua" : resultUnit.unit_name,
      tahun_ajaran: resultPeriod.period_start
        ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
        : "Semua",
      title: `Rekap Laporan per Jenis Anggaran (Jurnal Umum) per Tanggal ${moment(
        tanggal_awal
      ).format("DD MMMM YYYY")} Sampai ${moment(tanggal_akhir).format(
        "DD MMMM YYYY"
      )}`,
      data_payment: combinedResult,
      sub_total_masuk: subTotalMasuk,
      sub_total_keluar: subTotalKeluar,
      ...newResultCashAccount,
      total_masuk: subTotalMasuk + newResultCashAccount.saldo_awal_debit,
      total_keluar: subTotalKeluar + newResultCashAccount.saldo_awal_kredit,
      saldo_akhir:
        subTotalMasuk +
        newResultCashAccount.saldo_awal_debit -
        (subTotalKeluar + newResultCashAccount.saldo_awal_kredit),
    };
    const accountCodeArr = helpers.extractUniqueAccountCodes(newResult);
    console.log(accountCodeArr);
    const newResultByAccountCode = accountCodeArr.map((item) => {
      const dataFilteredDebit = newResult.data_payment.filter(
        (itemFilter) =>
          itemFilter.account_code == item &&
          (itemFilter.account_cost_account_code?.includes("4-4") ||
            itemFilter.account_code?.includes("4-4"))
      );
      const dataFilteredKredit = newResult.data_payment.filter(
        (itemFilter) =>
          itemFilter.account_code == item &&
          (itemFilter.account_cost_account_code?.includes("5-5") ||
            itemFilter.account_code?.includes("5-5"))
      );
      return {
        code: item,
        description: resultCashAccount.filter(
          (itemAccount) => itemAccount?.account_code == item
        )[0]?.account_description,
        data_payment: {
          debit: {
            data: dataFilteredDebit,
            sub_total_masuk: dataFilteredDebit.reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.total || 0, 10),
              0
            ),
            sub_total_keluar: dataFilteredDebit.reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.total_keluar || 0, 10),
              0
            ),
          },
          kredit: {
            data: dataFilteredKredit,
            sub_total_masuk: dataFilteredKredit.reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.total || 0, 10),
              0
            ),
            sub_total_keluar: dataFilteredKredit.reduce(
              (accumulator, currentValue) =>
                accumulator + parseInt(currentValue.total_keluar || 0, 10),
              0
            ),
          },
        },
        total: newResult.data_payment
          .filter((itemFilter) => itemFilter.account_code == item)
          ?.reduce(
            (accumulator, currentValue) =>
              accumulator + parseFloat(currentValue.total || 0, 10),
            0
          ),
        total_keluar: newResult.data_payment
          .filter((itemFilter) => itemFilter.account_code == item)
          ?.reduce(
            (accumulator, currentValue) =>
              accumulator + parseFloat(currentValue.total_keluar || 0, 10),
            0
          ),
      };
    });
    const result = await generateDokumenLaporanJurnalUmumPerAnggaran(
      "../assets/pdfTemplate/laporan/laporan-jurnal-umum-per-anggaran.html",
      newResult,
      newResultByAccountCode
    );
    return helpers.response(
      res,
      200,
      "GET Dokumen Per anggaran kas tunai berhasil",
      result
    );
  }),
  laporanExcelRekapPembayaran: promiseHandler(async (req, res, next) => {
    const { class_id, period_id, unit_id } = req.query;
    const queryFormat = {};
    // untuk penyesuaian query di sql
    queryFormat.class_class_id =
      class_id == "" || class_id == undefined ? "" : class_id;
    queryFormat.unit_unit_id =
      unit_id == "" || unit_id == undefined ? "" : unit_id;
    const queryToString = helpers.queryToString(queryFormat);

    const resultSiswa = await studentModel.getAllSiswa(queryToString);

    const resultMonthly =
      await monthlyPaymentModel.getAllMonthlyPaymentAllStudent(
        unit_id || "",
        class_id || "",
        period_id || ""
      );
    const resultFree = await freePaymentModel.getAllFreePaymentAllStudent(
      unit_id || "",
      class_id || "",
      period_id || ""
    );
    const resultFreeSortRemaining = resultFree
      .filter((item) => item.payment_rate_bebas_pay_remaining !== null)
      .sort(
        (a, b) =>
          a.payment_rate_bebas_pay_remaining -
          b.payment_rate_bebas_pay_remaining
      );

    const ids = resultSiswa.map((item) => item.student_id).join(",");
    const monthlyPaymentType =
      await monthlyPaymentModel.getMonthlyPaymentTypeAllStudentByPaymentQuery(
        ids
      );
    const freePaymentType = await freePaymentModel.getFreePaymentTypeByStudent(
      ids
    );

    const query = `WHERE student_student_id IN(${ids})`;
    const headers = await paymentRateModel.getHeadersAllPaymentRateByStudents(
      query
    );

    // console.log(resu)
    const filterByMonthType = monthlyPaymentType.map((item) => ({
      ...item,
      detail: resultMonthly.filter(
        (itemMonthly) => itemMonthly.payment_rate_id == item.payment_rate_id
      ),
    }));
    const filterByFreeType = freePaymentType.map((item) => ({
      ...item,
      detail: resultFreeSortRemaining.filter(
        (itemFree) => itemFree.payment_rate_id == item.payment_rate_id
      ),
    }));

    const resultWithStudent = resultSiswa.map((item) => ({
      ...item,
      payment_type: [...resultMonthly, ...resultFreeSortRemaining].filter(
        (itemFilter) => itemFilter.student_student_id == item.student_id
      ),
    }));
    const resultUnit = await unitModel.getUnitById(unit_id);
    const resultUnitUser = await unitModel.getUnitByUser(req.token.user_id);
    const classResult = await classModel.getKelasById(class_id);
    const resultPeriod = period_id
      ? await periodModel.getTahunAjaranById(period_id)
      : "Semua";
    const month = await monthModel.getAllMonth();
    const newHeaders = [
      ...new Set(
        [...headers].map((item) => ({
          payment_rate_id: item.payment_rate_id,
          payment_payment_id: item.payment_payment_id,
          period_start: item.period_start,
          period_end: item.period_end,
          payment_type: item.payment_type,
          pos_pay_name: item.pos_pay_name,
          detail: {
            monthly: item.payment_type == "BULANAN" ? [...month] : null,
          },
        }))
      ),
    ];

    // Create a new array with unique `pos_pay_name`
    const uniqueHeaders = headers
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.pos_pay_name === item.pos_pay_name &&
              t.period_start === item.period_start &&
              t.period_end === item.period_end &&
              t.payment_type === item.payment_type
          )
      )
      .map((item) => ({
        payment_rate_id: item.payment_rate_id,
        payment_payment_id: item.payment_payment_id,
        period_start: item.period_start,
        period_end: item.period_end,
        payment_type: item.payment_type,
        pos_pay_name: item.pos_pay_name,
        detail: { monthly: item.payment_type == "BULANAN" ? [...month] : null },
      }));
    const newResult = {
      unit_name:
        unit_id !== ""
          ? `${resultUnit.unit_name}` + " " + `${resultUnit.unit_full_name}`
          : `${resultUnitUser[0].unit_full_name}`,
      unit_address:
        unit_id !== ""
          ? resultUnit.unit_address
          : resultUnitUser[0].unit_address,
      unit_phone:
        unit_id !== "" ? resultUnit.unit_phone : resultUnitUser[0].unit_phone,
      unit_person:
        unit_id !== "" ? resultUnit.unit_person : resultUnitUser[0].unit_person,
      unit_person_name:
        unit_id !== ""
          ? resultUnit.unit_person_name
          : resultUnitUser[0].unit_person_name,
      unit_person_nip:
        unit_id !== ""
          ? resultUnit.unit_person_nip
          : resultUnitUser[0].unit_person_nip,
      unit_kota:
        unit_id !== "" ? resultUnit.unit_kota : resultUnitUser[0].unit_kota,
      unit: unit_id == "" ? "Semua" : resultUnit.unit_name,
      class_name: classResult.class_name,
      tahun_ajaran: resultPeriod.period_start
        ? `${resultPeriod.period_start}/${resultPeriod.period_end}`
        : "Semua",
      title: `Laporan Rekap pembayaran ${resultUnit.unit_name} kelas ${classResult.class_name}`,
      headers: uniqueHeaders,
      students: resultWithStudent,
    };

    const result = await generateExcelLaporanRekapPembayaran(newResult);
    return helpers.response(
      res,
      200,
      "GET Dokumen rekap pembayaran berhasil",
      result
    );
  }),
};
