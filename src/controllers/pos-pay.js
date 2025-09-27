/* eslint-disable camelcase */
const { validationResult } = require("express-validator");
const helpers = require("../helpers");
const { promiseHandler } = require("../middleware/promiseHandler");
const posPayModel = require("../models/pos-pay");
const accountCostModel = require("../models/account-cost");
const { customErrorApi } = require("../helpers/CustomError");

module.exports = {
  getAllPosPay: promiseHandler(async (req, res, next) => {
    const { unit_unit_id } = req.query;
    const query =
      unit_unit_id == undefined || unit_unit_id == ""
        ? ""
        : `WHERE account1.unit_unit_id=${unit_unit_id}`;
    const result = await posPayModel.getAllPosPay(query, unit_unit_id);
    return helpers.response(res, 200, "get All Pos Pay Successfully", result);
  }),
  postPosPay: promiseHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return helpers.response(res, 442, "Post data failed", {
        errors: errors.array(),
      });
    }
    const {
      // account_account_code,
      account_account_credit,
      account_account_id,
      pos_pay_name,
      pos_pay_description,
      unit_unit_id,
    } = req.body;

    const accountResult = await accountCostModel.getAccountCostById(
      account_account_id
    );
    const setData = {
      account_account_id,
      account_account_code: accountResult.account_code,
      account_account_credit,
      pos_pay_name,
      pos_pay_description,
    };
    const result = await posPayModel.postPosPay(setData);

    return helpers.response(res, 201, "Post Data Pos Pay Successfully", result);
  }),
  putPosPay: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const {
      account_account_id,
      account_account_credit,
      pos_pay_name,
      pos_pay_description,
    } = req.body;

    const checkData = await posPayModel.getPosPayById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const accountResult = await accountCostModel.getAccountCostById(
      account_account_id
    );
    const setData = {
      account_account_id,
      account_account_code: accountResult.account_code,
      account_account_credit,
      pos_pay_name,
      pos_pay_description,
    };
    const result = await posPayModel.putPosPay(id, setData);

    return helpers.response(res, 200, "put Pos Pay Successfully", result);
  }),
  deletePosPay: promiseHandler(async (req, res, next) => {
    const { id } = req.params;

    const checkData = await posPayModel.getPosPayById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    const result = await posPayModel.deletePosPay(id);

    return helpers.response(res, 200, "delete Pos Pay Successfully", result);
  }),
};
