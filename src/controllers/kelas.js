const helpers = require("../helpers");
const { customErrorApi } = require("../helpers/CustomError");
const { promiseHandler } = require("../middleware/promiseHandler");
const kelasModel = require("../models/kelas");

module.exports = {
  getAllKelas: promiseHandler(async (req, res, next) => {
    const { unit_unit_id } = req.query || "";
    const query =
      unit_unit_id == undefined || unit_unit_id == ""
        ? ""
        : `where unit_unit_id=${unit_unit_id}`;

    const result = await kelasModel.getAllKelas(query);
    return helpers.response(res, 200, "Get All Kelas Successfully", result);
  }),
  getKelasById: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await kelasModel.getKelasById(id);
    if (!result) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    return helpers.response(res, 200, "Get Kelas By ID Successfully", result);
  }),
  getKelasByProdi: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await kelasModel.getKelasByProdi(id);
    if (!result) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    return helpers.response(
      res,
      200,
      "Get Kelas By Prodi Successfully",
      result
    );
  }),
  postKelas: promiseHandler(async (req, res, next) => {
    const { body } = req;

    const result = await kelasModel.postKelas(body);
    return helpers.response(
      res,
      200,
      "Data Kelas Berhasil Ditambahkan",
      result
    );
  }),
  putKelas: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { body } = req;
    const checkData = await kelasModel.getKelasById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const result = await kelasModel.putKelas(id, body);
    return helpers.response(res, 200, "Data Kelas Berhasil Diubah", result);
  }),
  deleteKelas: promiseHandler(async (req, res, next) => {
    const { id } = req.params;

    const checkData = await kelasModel.getKelasById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const result = await kelasModel.deleteKelas(id);
    return helpers.response(res, 200, "Data Kelas Berhasil Dihapus", result);
  }),
};
