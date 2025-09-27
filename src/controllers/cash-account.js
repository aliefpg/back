const moment = require("moment");
const helpers = require("../helpers");
const { customErrorApi } = require("../helpers/CustomError");
const { promiseHandler } = require("../middleware/promiseHandler");
const cashAccountModel = require("../models/cash-account");
const saldoAwal = require("../models/cash-account");

module.exports = {
  getAllCashAccount: promiseHandler(async (req, res, next) => {
    const { unit_unit_id } = req.query;
    const query =
      unit_unit_id == undefined || unit_unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_unit_id}`;
    const queryFormat = {};

    const result = await cashAccountModel.getAllCashAccount(query);
    const newResult = {
      data: result,
      total_debit: result.reduce(
        (accumulator, currentValue) =>
          accumulator + parseFloat(currentValue.cash_account_debit, 10),
        0
      ),
      total_kredit: result.reduce(
        (accumulator, currentValue) =>
          accumulator + parseFloat(currentValue.cash_account_kredit, 10),
        0
      ),
    };

    return helpers.response(res, 200, "Get Saldo Awal Berhasil", newResult);
  }),
  putCashAccount: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { body } = req;

    const result = await cashAccountModel.putSaldoAwal(id, body);

    return helpers.response(res, 200, "Put Saldo Awal Successfully", result);
  }),
};
