/* eslint-disable camelcase */
const moment = require("moment");
const helpers = require("../helpers");
const { customErrorApi } = require("../helpers/CustomError");
const { promiseHandler } = require("../middleware/promiseHandler");
const debitModel = require("../models/debit");
const logModel = require("../models/log");

module.exports = {
  getAllDebitSubmitted: promiseHandler(async (req, res, next) => {
    const { unit_unit_id } = req.query || "";

    const result = await debitModel.getAllDebitSubmitted(unit_unit_id);
    return helpers.response(res, 200, "Get All Debit Successfully", result);
  }),

  geDebitNotSubmitted: promiseHandler(async (req, res, next) => {
    const { unit_id, no_ref } = req.query;
    const result = await debitModel.getAllDebitNoSubmittedByRef(
      unit_id,
      no_ref
    );
    if (!result) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    const newArr = [
      ...result.map((item) => ({
        ...item,
        total:
          parseFloat(
            (parseFloat(item.debit_tax, 10) / 100) * item.debit_value
          ) + parseFloat(item.debit_value, 10),
      })),
    ];
    const newResult = {
      result: [...newArr],
      total: newArr.reduce(
        (accumulator, currentValue) => accumulator + parseFloat(currentValue.total, 10),
        0
      ),
      total_tax: newArr.reduce(
        (accumulator, currentValue) => accumulator + parseFloat(currentValue.debit_tax, 10),
        0
      ),
      total_value: newArr.reduce(
        (accumulator, currentValue) => accumulator + parseFloat(currentValue.debit_value, 10),
        0
      ),
    };

    return helpers.response(
      res,
      200,
      "Get Debit Not Submitted Successfully",
      newResult
    );
  }),
  postDebitNotSubmitted: promiseHandler(async (req, res, next) => {
    const {
      debit_date,
      debit_no_ref,
      debit_desc,
      debit_value,
      account_cash_account,
      account_cost_account,
      debit_tax,
      debit_information,
      unit_unit_id,
    } = req.body;

    const { token } = req;

    const formBody = {
      debit_date: moment(debit_date).format("YYYY-MM-DD HH:MM:SS"),
      debit_no_ref,
      debit_desc,
      debit_value,
      account_cash_account,
      account_cost_account,
      debit_tax,
      debit_total: parseInt(debit_value, 10) + ((parseInt(debit_value, 10) * parseInt(debit_tax, 10) / 100)),
      debit_information,
      unit_unit_id,
      is_submit: 0,
      user_user_id: token.user_id ?? null,
    };

    const result = await debitModel.postDebit(formBody);

    const setDataLog = {
      description: `${token.user_full_name} Menambah draft Kas Masuk dengan ID ${result.insertId}`,
      user_user_id: token.user_id ?? null,
    };
    console.log(token);
    await logModel.postLog(setDataLog);
    return helpers.response(
      res,
      200,
      "Data Debit Berhasil Ditambahkan",
      result
    );
  }, true),
  postDebitSubmitted: promiseHandler(async (req, res, next) => {
    const { debit_ids } = req.body;
    const { token } = req;
    const formBody = {
      is_submit: 1,
    };

    const result = await debitModel.putDebitssByMoreId(
      debit_ids.join(","),
      formBody
    );
    const setDataLog = {
      description: `${token.user_full_name
      } Melakukan Submit Kas Masuk dengan ID ${debit_ids.join(",")}`,
      user_user_id: token.user_id ?? null,
    };
    await logModel.postLog(setDataLog);
    return helpers.response(
      res,
      200,
      "Data Debit Berhasil Ditambahkan",
      result
    );
  }, true),

  generateNoRef: promiseHandler(async (req, res, next) => {
    const { unit_name } = req.body;
    let code = `JM${unit_name}${moment().format("DDMMYY")}00`;
    const checkData = await debitModel.getDebitByNoRef(code);
    const lastArr = checkData[0]?.debit_no_ref
      .substring(checkData[0].debit_no_ref.length - 2)
      .split("");
    const newDigit = lastArr
      ? `${lastArr[0]}${parseInt(lastArr[1]) + 1}`
      : "01";

    code += newDigit;
    return helpers.response(res, 200, "Data No ref Debit Berhasil Digenerate", {
      no_ref: code,
    });
  }),
  putDebit: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const {
      debit_date,
      debit_no_ref,
      debit_desc,
      debit_value,
      account_cash_account,
      account_cost_account,
      debit_tax,
      debit_information,
      unit_unit_id,
    } = req.body;

    const { token } = req;

    const formBody = {
      debit_date: helpers.convertTimestampToMySQLDate(debit_date),
      debit_no_ref,
      debit_desc,
      debit_value,
      account_cash_account,
      account_cost_account,
      debit_tax,
      debit_information,
      unit_unit_id,
    };

    const checkData = await debitModel.getDebitById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    const result = await debitModel.putDebit(id, formBody);

    const setDataLog = {
      description: `${token.user_full_name} Melakukan Ubah Kas Masuk dengan ID ${id}`,
      user_user_id: token.user_id ?? null,
    };
    await logModel.postLog(setDataLog);

    return helpers.response(res, 200, "Data Kredit Berhasil Diubah", result);
  }, true),
  deleteDebit: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    console.log(id);
    const { token } = req;

    const checkData = await debitModel.getDebitById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const result = await debitModel.deleteDebit(id);

    const setDataLog = {
      description: `${token.user_full_name} Melakukan Hapus Kas Masuk dengan ID ${id}`,
      user_user_id: token.user_id ?? null,
    };
    await logModel.postLog(setDataLog);
    return helpers.response(res, 200, "Data Debit Berhasil Dihapus", result);
  }),
};
