/* eslint-disable camelcase */
const { validationResult } = require("express-validator");
const helpers = require("../helpers");
const { promiseHandler } = require("../middleware/promiseHandler");
const accountCostModel = require("../models/account-cost");
const cashAccountModel = require("../models/cash-account");
const { customErrorApi } = require("../helpers/CustomError");

module.exports = {
  getAllAccountCost: promiseHandler(async (req, res, next) => {
    const { unit_unit_id } = req.query;
    const query =
      unit_unit_id == undefined || unit_unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_unit_id}`;
    console.log(unit_unit_id);

    const result = await accountCostModel.getAllAccountCost(query);
    return helpers.response(
      res,
      200,
      "get All Account Cost Successfully",
      result
    );
  }),
  // get data akun yang typenya pembayaran
  getAllAccountCostPay: promiseHandler(async (req, res, next) => {
    const { unit_unit_id } = req.query;
    const query = `WHERE account_category=1 
      ${
        unit_unit_id == undefined || unit_unit_id == ""
          ? ""
          : `AND account.unit_unit_id=${unit_unit_id}`
      }`;
    const result = await accountCostModel.getAllAccountCostPosBayar(query);
    console.log(result);
    return helpers.response(
      res,
      200,
      "get All Account Cost Pos Successfully",
      result
    );
  }),
  // get all account dengan awalan 5 /biaya
  getAllAccountJenisBiayaKeluar: promiseHandler(async (req, res, next) => {
    const { unit_unit_id } = req.query;
    const query = `WHERE account_code LIKE '5-50%' AND account_type=2 
      ${
        unit_unit_id == undefined || unit_unit_id == ""
          ? ""
          : `AND account.unit_unit_id=${unit_unit_id}`
      }`;
    const result = await accountCostModel.getAllAccountCost(query);
    console.log(result);
    return helpers.response(
      res,
      200,
      "get All Account Jenis Biaya Successfully",
      result
    );
  }),
  getAllAccountJenisBiayaMasuk: promiseHandler(async (req, res, next) => {
    const { unit_unit_id } = req.query;
    const query = `WHERE account_code LIKE '4-40%' AND account_type=2 
      ${
        unit_unit_id == undefined || unit_unit_id == ""
          ? ""
          : `AND account.unit_unit_id=${unit_unit_id}`
      }`;
    const result = await accountCostModel.getAllAccountCost(query);
    console.log(result);
    return helpers.response(
      res,
      200,
      "get All Account Jenis Biaya Successfully",
      result
    );
  }),
  getAllAktivaAccountCost: promiseHandler(async (req, res, next) => {
    const { unit_unit_id } = req.query;
    const query =
      unit_unit_id == undefined || unit_unit_id == ""
        ? ""
        : `AND unit_unit_id=${unit_unit_id}`;
    const result = await accountCostModel.getAllAktivaAccountCost(query);
    return helpers.response(
      res,
      200,
      "get All Aktiva Account Cost Pos Successfully",
      result
    );
  }),
  getGenerateCodeAccountCost: promiseHandler(async (req, res, next) => {
    const { account_code, account_type, unit_unit_id } = req.body;
    // console.log(req.body);
    const unitIdQuery =
      unit_unit_id == undefined || unit_unit_id == ""
        ? ""
        : `and unit_unit_id=${unit_unit_id}`;
    if (account_type < 3) {
      const query =
        account_type == 1
          ? `${account_code.slice(0, 4)}`
          : `${account_code.slice(0, 5)}`;
      console.log(unitIdQuery);

      const checkData = await accountCostModel.getAccountCostByTypeAndId(
        query,
        unitIdQuery
      );
      console.log(checkData);

      const checkDataFilter =
        account_type == 1
          ? checkData.filter(
              (item) =>
                parseInt(item.account_code.split("-")[1], 10) % 100 === 0
            )
          : checkData;
      const lastNumber =
        checkDataFilter[checkDataFilter.length - 1]?.account_code || 0;
      const newCode =
        account_type == 1
          ? `${lastNumber.split("-")[0]}-${
              parseInt(lastNumber.split("-")[1], 10) + 100
            }`
          : `${lastNumber.split("-")[0]}-${
              parseInt(lastNumber.split("-")[1], 10) + 1
            }`;
      return helpers.response(res, 200, "get  Account Cost Code Successfully", {
        code: newCode,
      });
    }

    const query = account_code;
    const checkData = await accountCostModel.getAccountCostByTypeAndId(
      query,
      unitIdQuery
    );

    const lastNumber = checkData[checkData.length - 1].account_code;
    const newCode = lastNumber.split(".")[account_type - 2]
      ? `${lastNumber}.${
          parseInt(lastNumber.split(".")[account_type - 2], 10) + 1
        }`
      : `${lastNumber}.1`;
    return helpers.response(res, 200, "get  Account Cost Code Successfully", {
      code: newCode,
    });
  }),

  postAccountCost: promiseHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return helpers.response(res, 442, "Post data failed", {
        errors: errors.array(),
      });
    }
    const {
      account_code,
      account_type,
      account_description,
      account_note,
      account_category,
      account_majors_id,
      unit_unit_id,
    } = req.body;
    // const query = account_type == 1 ? `${code.slice(0, 4)}` : `${code.slice(0, 5)}`;

    // const checkData = await accountCostModel.getAccountCostByTypeAndId(query);
    // const checkDataFilter = account_type == 1 ? checkData.filter((item) => parseInt(item.account_code.split('-')[1], 10) % 100 === 0) : checkData;
    // console.log(checkDataFilter);
    // const lastNumber = checkDataFilter[checkDataFilter.length - 1].account_code;
    // const newCode = account_type == 1 ? `${lastNumber.split('-')[0]}-${parseInt(lastNumber.split('-')[1], 10) + 100}` : `${lastNumber.split('-')[0]}-${parseInt(lastNumber.split('-')[1], 10) + 1}`;
    const setData = {
      account_code,
      account_type,
      account_description,
      account_note: account_note || 0,
      account_category: account_category || 0,
      account_majors_id: account_majors_id || 0,
      unit_unit_id, // sekolah
    };
    const result = await accountCostModel.postAccountCost(setData);
    await cashAccountModel.postCashAccount({
      account_account_id: result.account_id,
      unit_unit_id,
    });

    return helpers.response(
      res,
      201,
      "Post Data Account Cost Successfully",
      result
    );
  }),
  putAccountCost: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { unit_unit_id, account_description, account_category } = req.body;

    const checkData = await accountCostModel.getAccountCostById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const setData = {
      account_category,
      account_description,
      unit_unit_id, // sekolah
    };
    const result = await accountCostModel.putAccountCost(id, setData);

    return helpers.response(res, 200, "put Account Cost Successfully", result);
  }),
  deleteAccountCost: promiseHandler(async (req, res, next) => {
    const { id } = req.params;

    const checkData = await accountCostModel.getAccountCostById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    const result = await accountCostModel.deleteAccountCost(id);

    return helpers.response(
      res,
      200,
      "delete Account Cost Successfully",
      result
    );
  }),
};
