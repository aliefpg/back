const helpers = require("../helpers");
const { customErrorApi } = require("../helpers/CustomError");
const { promiseHandler } = require("../middleware/promiseHandler");
const prodiModel = require("../models/program-studi");

module.exports = {
  getAllProdi: promiseHandler(async (req, res, next) => {
    const { unit_unit_id } = req.query || "";
    const query =
      unit_unit_id == undefined || unit_unit_id == ""
        ? ""
        : `WHERE unit_unit_id=${unit_unit_id}`;
    const result = await prodiModel.getAllProgramStudi(query);
    return helpers.response(res, 200, "Get All Prodi Successfully", result);
  }),
  getProdiById: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await prodiModel.getProdiById(id);
    if (!result) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    return helpers.response(res, 200, "Get Prodi By ID Successfully", result);
  }),
  postProdi: promiseHandler(async (req, res, next) => {
    const { body } = req;

    const result = await prodiModel.postProgramStudi(body);
    return helpers.response(
      res,
      200,
      "Data Prodi Berhasil Ditambahkan",
      result
    );
  }),
  putProdi: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { body } = req;
    const checkData = await prodiModel.getProdiById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const result = await prodiModel.putProgramStudi(id, body);
    return helpers.response(res, 200, "Data Prodi Berhasil Diubah", result);
  }),
  deleteProdi: promiseHandler(async (req, res, next) => {
    const { id } = req.params;

    const checkData = await prodiModel.getProdiById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const result = await prodiModel.deleteProgramStudi(id);
    return helpers.response(res, 200, "Data Prodi Berhasil Dihapus", result);
  }),
};
