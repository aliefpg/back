/* eslint-disable no-undef */
/* eslint-disable no-return-assign */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable max-len */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
const { promiseHandler } = require("../middleware/promiseHandler");
const monthlyPaymentModel = require("../models/monthly-payment");
const siswaModel = require("../models/siswa");
const freePaymentModel = require("../models/free-payment");
const paymentTypeModel = require("../models/payment-type");
const paymentTransactionModel = require("../models/payment-transaction");
const studentModel = require("../models/siswa");
const creditModel = require("../models/kredit");
const debitModel = require("../models/debit");
const cashAccountModel = require("../models/cash-account");
const monthModel = require("../models/month");
const helpers = require("../helpers");
const paymentRateModel = require("../models/payment-rate");

module.exports = {
  laporanPembayaranPerKelas: promiseHandler(async (req, res, next) => {
    const { unit_id, class_id, period_id, payment_type } = req.query;
    const queryFormat = {};
    console.log(class_id);
    // untuk penyesuaian query di sql
    queryFormat.class_class_id =
      class_id == "" || class_id == undefined ? "" : class_id;
    queryFormat.unit_unit_id =
      unit_id == "" || unit_id == undefined ? "" : unit_id;
    const queryToString = helpers.queryToString(queryFormat);

    const resultSiswa = await siswaModel.getAllSiswa(queryToString);
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

    const total = [...resultFree, ...resultMonthly].reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.payment_rate_bill, 10),
      0
    );
    const newResult = resultSiswa.map((student) => ({
      ...student,
      total_tagihan:
        (parseInt(
          resultFree.filter((item) => item.student_id == student.student_id)[0]
            ?.payment_rate_bill,
          10
        ) || 0) +
        (resultMonthly
          .filter((item) => item.student_id == student.student_id)
          .reduce(
            (accumulator, currentValue) =>
              accumulator + parseInt(currentValue.payment_rate_bill, 10),
            0
          ) || 0),
      rsult_free:
        parseInt(
          resultFree.filter(
            (item) => item.student_student_id == student.student_id
          )[0]?.payment_rate_bill,
          10
        ) || 0,
      rsult_month: resultMonthly
        .filter((item) => item.student_id == student.student_id)
        .reduce(
          (accumulator, currentValue) =>
            accumulator + parseInt(currentValue.payment_rate_bill, 10),
          0
        ),

      sisa_tagihan:
        (parseInt(
          resultFree.filter((item) => item.student_id == student.student_id)[0]
            ?.payment_rate_bebas_pay_remaining,
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
          resultFree.filter((item) => item.student_id == student.student_id)[0]
            ?.payment_rate_bill,
          10
        ) || 0) -
        (parseInt(
          resultFree.filter((item) => item.student_id == student.student_id)[0]
            ?.payment_rate_bebas_pay_remaining,
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
    }));
    return helpers.response(
      res,
      200,
      "GET Data Laporan pembayaran per kelas berhasil",
      newResult
    );
  }),
  laporanPembayaranPerTanggal: promiseHandler(async (req, res, next) => {
    const {
      unit_id,
      class_id,
      period_id,
      payment_type,
      tanggal_awal,
      tanggal_akhir,
    } = req.query;
    const queryFormat = {};
    console.log(class_id);
    // untuk penyesuaian query di sql
    queryFormat.class_class_id =
      class_id == "" || class_id == undefined ? "" : class_id;
    queryFormat.unit_unit_id =
      unit_id == "" || unit_id == undefined ? "" : unit_id;
    const queryToString = helpers.queryToString(queryFormat);

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

    const newResultPayment = resultPaymentType.map((item) => ({
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
    }));
    return helpers.response(
      res,
      200,
      "GET data Laporan pembayaran per tanggal berhasil",
      newResultPayment
    );
  }),
  laporanTagihanSiswa: promiseHandler(async (req, res, next) => {
    const { class_id, period_id, unit_id, tanggal_awal, tanggal_akhir } =
      req.query;
    const queryFormat = {};
    console.log(class_id);
    // untuk penyesuaian query di sql
    queryFormat.class_class_id =
      class_id == "" || class_id == undefined ? "" : class_id;
    queryFormat.unit_unit_id =
      unit_id == "" || unit_id == undefined ? "" : unit_id;
    const queryToString = helpers.queryToString(queryFormat);

    const result = await studentModel.getAllSiswa(queryToString);
    const resultMonthly =
      await monthlyPaymentModel.getTagihanMonthlyPaymentAllStudentWithDate(
        unit_id || "",
        class_id || "",
        period_id || "",
        tanggal_awal,
        tanggal_akhir
      );
    const resultFree = await freePaymentModel.getTagihanFreeAllStudentWithDate(
      unit_id || "",
      class_id || "",
      period_id || "",
      tanggal_awal,
      tanggal_akhir
    );
    const freeIds = resultFree.map((item) => item.payment_id);
    const monthlyIds = resultMonthly.map((item) => item.payment_payment_id);
    const allIds = [...new Set([...freeIds, ...monthlyIds])];
    const regex = /,\s*$/;

    const paymentTypeResult = await paymentTypeModel.getPaymentTypeByIds(
      allIds.join(",").replace(regex, "" ?? "")
    );
    console.log("masuk");
    const newResult = result.map((student) => ({
      ...student,
      total_tagihan:
        resultMonthly
          .filter((item) => item.student_id == student.student_id)
          ?.reduce(
            (accumulator, currentValue) =>
              accumulator + parseFloat(currentValue.payment_rate_bill, 10),
            0
          ) +
        resultFree
          .filter((item) => item.student_id == student.student_id)
          ?.reduce(
            (accumulator, currentValue) =>
              accumulator +
              (parseFloat(currentValue.payment_rate_bill, 10) -
                parseFloat(currentValue.payment_rate_total_pay, 10)),
            0
          ),

      detail: paymentTypeResult
        .filter((item) => item.student_student_id == student.student_id)
        ?.map((itemPayment) => ({
          ...itemPayment,
          total:
            resultMonthly
              .filter(
                (item) =>
                  item.student_id == student.student_id &&
                  item.payment_payment_id == itemPayment.payment_id
              )
              ?.reduce(
                (accumulator, currentValue) =>
                  accumulator +
                  parseFloat(currentValue.payment_rate_bill ?? 0, 10),
                0
              ) ||
            resultFree
              .filter(
                (item) =>
                  item.student_id == student.student_id &&
                  item.payment_id == itemPayment.payment_id
              )
              ?.reduce(
                (accumulator, currentValue) =>
                  accumulator +
                  (parseFloat(currentValue.payment_rate_bill, 10) -
                    parseFloat(currentValue.payment_rate_total_pay, 10)),
                0
              ),
        })),
      result_month: resultMonthly.filter(
        (item) => item.student_id == student.student_id
      ),
      result_free: resultFree.filter(
        (item) => item.student_id == student.student_id
      ),
    }));
    return helpers.response(
      res,
      200,
      "Get Laporan Tagihan siswa berhasil",
      newResult
    );
  }),
  laporanRekapPembayaran: promiseHandler(async (req, res, next) => {
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
    const newResult = { headers: uniqueHeaders, students: resultWithStudent };

    return helpers.response(
      res,
      200,
      "Get Rekap Pembayaran siswa berhasil",
      newResult
    );
  }),
  laporanKasBank: promiseHandler(async (req, res, next) => {
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
    const resultKreditPrev = await creditModel.getAllKreditSubmittedWithDate(
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
    const resultKredit = await creditModel.getAllKreditSubmittedWithDate(
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
    console.log(resultMonthly);
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
    const newResult = {
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
    return helpers.response(
      res,
      200,
      "Get Laporan kas bank berhasil",
      newResult
    );
  }),
  laporanKasTunai: promiseHandler(async (req, res, next) => {
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
    const resultKreditPrev = await creditModel.getAllKreditSubmittedWithDate(
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
    const resultKredit = await creditModel.getAllKreditSubmittedWithDate(
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
    const newResult = {
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

    return helpers.response(
      res,
      200,
      "Get Laporan kas tunai berhasil",
      newResult
    );
  }),
  laporanJurnalUmum: promiseHandler(async (req, res, next) => {
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
    const resultKreditPrev = await creditModel.getAllKreditSubmittedWithDate(
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
    const resultKredit = await creditModel.getAllKreditSubmittedWithDate(
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
    const newResult = {
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

    return helpers.response(
      res,
      200,
      "Get Laporan kas jurnal umum berhasil",
      newResult
    );
  }),
};
