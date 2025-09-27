/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
const freePaymentModel = require("../models/free-payment");
const creditModel = require("../models/kredit");
const debitModel = require("../models/debit");
const cashAccountModel = require("../models/cash-account");

const monthlyPaymentModel = require("../models/monthly-payment");

module.exports = {

  getDataKasByDate: async (tanggal_awal, tanggal_akhir, period_id, unit_id) => {
    // semua data sampai sebelum tanggal_akhir
    const resultMonthlyPrev = await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
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
          ? (acc[cur.account_code].total = parseInt(acc[cur.account_code].total || 0, 10)
                + parseInt(cur.total || 0, 10))
          : (acc[cur.account_code] = cur);
        acc[cur.account_code]
          ? (acc[cur.account_code].total_keluar = parseInt(acc[cur.account_code].total_keluar || 0, 10)
                + parseInt(cur.total_keluar || 0, 10))
          : (acc[cur.account_code] = cur);
        return acc;
      },
      {}
    );

    const queryPrev = unit_id == undefined || unit_id == ""
      ? ""
      : `WHERE unit_unit_id=${unit_id}`;
    const resultCashAccountPrev = await cashAccountModel.getAllCashAccount(
      queryPrev
    );
    const newResultCashAccountPrev = {
      saldo_awal_debit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) => accumulator + parseInt(currentValue.cash_account_debit, 10),
        0
      ),
      saldo_awal_kredit: resultCashAccountPrev.reduce(
        (accumulator, currentValue) => accumulator + parseInt(currentValue.cash_account_kredit, 10),
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
      (accumulator, currentValue) => accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluarPrev = combinedResultPrev.reduce(
      (accumulator, currentValue) => accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );

    console.log(resultMonthlyPrev);
    const saldoAkhirPrev = subTotalMasukPrev
        + newResultCashAccountPrev.saldo_awal_debit
        - (subTotalKeluarPrev + newResultCashAccountPrev.saldo_awal_kredit);

    // baru

    const resultMonthly = await monthlyPaymentModel.getKasMonthlyPaymentAllStudent(
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
        ? (acc[cur.account_code].total = parseInt(acc[cur.account_code].total || 0, 10)
              + parseInt(cur.total || 0, 10))
        : (acc[cur.account_code] = cur);
      acc[cur.account_code]
        ? (acc[cur.account_code].total_keluar = parseInt(acc[cur.account_code].total_keluar || 0, 10)
                + parseInt(cur.total_keluar || 0, 10) || 0)
        : (acc[cur.account_code] = cur);
      return acc;
    }, {});
    const query = unit_id == undefined || unit_id == ""
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
        (accumulator, currentValue) => accumulator + parseInt(currentValue.cash_account_kredit, 10),
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
      (accumulator, currentValue) => accumulator + parseInt(currentValue.total || 0, 10),
      0
    );
    const subTotalKeluar = combinedResult.reduce(
      (accumulator, currentValue) => accumulator + parseInt(currentValue.total_keluar || 0, 10),
      0
    );
    const newResultKas = {
      // data_payment: combinedResult,
      sub_total_masuk: subTotalMasuk,
      sub_total_keluar: subTotalKeluar,
      ...newResultCashAccount,
      total_masuk: subTotalMasuk + newResultCashAccount.saldo_awal_debit,
      total_keluar: subTotalKeluar + newResultCashAccount.saldo_awal_kredit,
      saldo_akhir:
          subTotalMasuk
          + newResultCashAccount.saldo_awal_debit
          - (subTotalKeluar + newResultCashAccount.saldo_awal_kredit),
    };
    return newResultKas;
  }
};
