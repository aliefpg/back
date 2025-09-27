const moment = require("moment");
const helpers = require("../helpers");
const { customErrorApi } = require("../helpers/CustomError");
const { promiseHandler } = require("../middleware/promiseHandler");
const paymentTypeModel = require("../models/payment-type");

module.exports = {
  getAllPaymentType: promiseHandler(async (req, res, next) => {
    const { unit_unit_id, period_period_id } = req.query;
    let query = unit_unit_id == undefined || unit_unit_id == "" ? "" : `WHERE unit_unit_id=${unit_unit_id}`;
    query += period_period_id == undefined ? "" : ` AND period_period_id=${period_period_id}`;
    console.log(query);
    console.log("ssss");
    const result = await paymentTypeModel.getAllPaymentType(query);

    return helpers.response(res, 200, "Get All Payment Type Successfully", result);
  }),
  getPaymentTypeById: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await paymentTypeModel.getPaymentTypeById(id);
    if (!result) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    return helpers.response(res, 200, "Get Payment Type By ID Successfully", result);
  }),

  postPaymentType: promiseHandler(async (req, res, next) => {
    const { body } = req;
    const setData = {
      ...body,
      payment_input_date: moment().format("YYYY-MM-DD  HH:mm:ss.000"),
      payment_last_update: moment().format("YYYY-MM-DD  HH:mm:ss.000"),
    };

    const result = await paymentTypeModel.postPaymentType(setData);
    return helpers.response(res, 200, "Post Payment Type Successfully", result);
  }),
  putPaymentType: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { body } = req;

    const checkData = await paymentTypeModel.getPaymentTypeById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const setData = {
      ...body,

      payment_last_update: moment().format("YYYY-MM-DD  HH:mm:ss.000"),
    };
    const result = await paymentTypeModel.putPaymentType(id, setData);
    return helpers.response(res, 200, "Put Payment Type Successfully", result);
  }),
  deletePaymentType: promiseHandler(async (req, res, next) => {
    const { id } = req.params;

    const checkData = await paymentTypeModel.getPaymentTypeById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const result = await paymentTypeModel.deletePaymentType(id);
    return helpers.response(res, 200, "Delete Payment Type Successfully", result);
  }),
};
