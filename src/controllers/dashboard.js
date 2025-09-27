/* eslint-disable max-len */
/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
const moment = require("moment");
const helpers = require("../helpers");
const { customErrorApi } = require("../helpers/CustomError");
const { promiseHandler } = require("../middleware/promiseHandler");
const dashboardModel = require("../models/dashboard");
const unitModel = require("../models/unit");
const siswaModel = require("../models/siswa");
const freePaymentModel = require("../models/free-payment");
const paymentTypeModel = require("../models/payment-type");
const paymentTransactionModel = require("../models/payment-transaction");
const studentModel = require("../models/siswa");
const creditModel = require("../models/kredit");
const debitModel = require("../models/debit");
const cashAccountModel = require("../models/cash-account");
const monthModel = require("../models/month");
const paymentRateModel = require("../models/payment-rate");
const monthlyPaymentModel = require("../models/monthly-payment");
const { getDataKasByDate } = require("../helpers/kas");

module.exports = {
  getDataDashboard: promiseHandler(async (req, res, next) => {
    const { user_id } = req.token;
    const { unit_id } = req.query;
    // const unitResult = await unitModel.getUnitByUser(user_id);
    // const unitIds = unitResult.map((item) => item.unit_id).join(",");



    const resultSiswa = await dashboardModel.getAllActiveSiswa([unit_id]);

    const outcomeToday = await getDataKasByDate(moment(new Date()).format("YYYY-MM-DD"), moment(new Date()).format("YYYY-MM-DD"), "", unit_id);
    const outcomeMonth = await getDataKasByDate(moment().startOf("month").format("YYYY-MM-DD"), moment(new Date()).format("YYYY-MM-DD"), "", unit_id);
    const outcomeYear = await getDataKasByDate(moment().startOf("year").format("YYYY-MM-DD"), moment(new Date()).format("YYYY-MM-DD"), "", unit_id);

    // kas

    const newResult = {
      jumlah_siswa_aktif: resultSiswa.jumlah_siswa_aktif,
      transaction_today: { ...outcomeToday },
      transaction_month: { ...outcomeMonth },
      transaction_year: { ...outcomeYear },

    };

    return helpers.response(res, 200, "Get All Siswa aktif Successfully", newResult);
  }),

};
