/* eslint-disable camelcase */
const { validationResult } = require("express-validator");
const helpers = require("../helpers");
const { promiseHandler } = require("../middleware/promiseHandler");
const posPayModel = require("../models/pos-pay");
const { customErrorApi } = require("../helpers/CustomError");
const accountCost = require("../models/account-cost");

module.exports = {
  getAllPiutang: promiseHandler(async (req, res, next) => {
    const { unit_unit_id } = req.query;
    const query = `where account_code LIKE'%1-1020%' ${
      unit_unit_id == undefined || unit_unit_id == ""
        ? ""
        : `AND unit_unit_id=${unit_unit_id}`
    }`;
    const result = await accountCost.getAllAccountCostByAccountCode(query);

    const newResult = result.filter((item) => item.account_type == 2);
    return helpers.response(
      res,
      200,
      "get All Piutang Successfully",
      newResult
    );
  }),
};
