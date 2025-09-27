const helpers = require("../helpers");
const { customErrorApi } = require("../helpers/CustomError");
const { promiseHandler } = require("../middleware/promiseHandler");
const tahunAjaranModel = require("../models/tahun-ajaran");
const connection = require("../config/db.config");

module.exports = {
  getAllTahunAjaran: promiseHandler(async (req, res, next) => {
    const result = await tahunAjaranModel.getAllTahunAjaran();
    return helpers.response(
      res,
      200,
      "Get All Tahun Ajaran Successfully",
      result
    );
  }),
  getTahunAjaranById: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await tahunAjaranModel.getTahunAjaranById(id);
    if (!result) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    return helpers.response(
      res,
      200,
      "Get Tahun Ajaran By ID Successfully",
      result
    );
  }),
  getTahunAjaranByProdi: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await tahunAjaranModel.getTahunAjaranByProdi(id);
    if (!result) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    return helpers.response(
      res,
      200,
      "Get Tahun Ajaran By Prodi Successfully",
      result
    );
  }),
  postTahunAjaran: promiseHandler(async (req, res, next) => {
    const { body } = req;

    const result = await tahunAjaranModel.postTahunAjaran(body);
    console.log(result);

    if (body.period_status == 1) {
      await tahunAjaranModel.putTahunAjaranStatusNotIn(result.period_id, {
        period_status: 0,
      });
    }
    return helpers.response(
      res,
      200,
      "Data Tahun Ajaran Berhasil Ditambahkan",
      result
    );
  }),
  putTahunAjaran: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { body } = req;

    const checkData = await tahunAjaranModel.getTahunAjaranById(id);

    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    const result = await tahunAjaranModel.putTahunAjaran(id, body);

    return helpers.response(
      res,
      200,
      "Data Tahun Ajaran Berhasil Diubah",
      result
    );
  }),
  putStatusTahunAjaran: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { body } = req;

    const checkData = await tahunAjaranModel.getTahunAjaranById(id);

    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    if (
      body.period_status == 1 &&
      body.period_status != checkData.period_status
    ) {
      const result1 = await tahunAjaranModel.putTahunAjaranStatusNotIn(id, {
        period_status: 0,
      });
    }
    const result = await tahunAjaranModel.putTahunAjaran(id, body);

    return helpers.response(
      res,
      200,
      "Data Tahun Ajaran Berhasil Diubah",
      result
    );
  }, true),
  deleteTahunAjaran: promiseHandler(async (req, res, next) => {
    const { id } = req.params;

    const checkData = await tahunAjaranModel.getTahunAjaranById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const result = await tahunAjaranModel.deleteTahunAjaran(id);
    return helpers.response(
      res,
      200,
      "Data Tahun Ajaran Berhasil Dihapus",
      result
    );
  }),
};
