const moment = require("moment");
const helpers = require("../helpers");
const { customErrorApi } = require("../helpers/CustomError");
const { promiseHandler } = require("../middleware/promiseHandler");
const alumniModel = require("../models/alumni");

module.exports = {
  // getAllSiswa: promiseHandler(async (req, res, next) => {
  //   let result;
  //   const { status } = req.query;
  //   if (status) {
  //     result = await siswaModel.getAllSiswaByStatus(status);
  //   } else {
  //     result = await siswaModel.getAllSiswa();
  //   }
  //   return helpers.response(res, 200, 'Get All Siswa Successfully', result);
  // }),
  getAllAlumni: promiseHandler(async (req, res, next) => {
    const { query } = req;
    const queryFormat = {};
    console.log(query);
    // untuk penyesuaian query di sql
    queryFormat.class_class_id =
      query.class_id == "" || query.class_id == undefined ? "" : query.class_id;
    queryFormat.student_status = 2;
    queryFormat.majors_majors_id =
      query.majors_id == "" || query.majors_id == undefined
        ? ""
        : query.majors_id;
    queryFormat.unit_unit_id =
      query.unit_id == "" || query.unit_id == undefined ? "" : query.unit_id;
    console.log(queryFormat);

    const queryToString = helpers.queryToString(queryFormat);

    const result = await alumniModel.getAllAlumni(queryToString);

    return helpers.response(res, 200, "Get All Alumni Successfully", result);
  }),
  getAlumniById: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await alumniModel.getSiswaById(id);
    if (!result) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    return helpers.response(res, 200, "Get Siswa By ID Successfully", result);
  }),
  //   getAllAlumniByStatus: promiseHandler(async (req, res, next) => {
  //     const { id } = req.params;
  //     const result = await siswaModel.getAllSiswaByStatus(id);
  //     if (!result) {
  //       return next(customErrorApi(404, 'ID Not Found'));
  //     }

  //     return helpers.response(res, 200, 'Get Siswa By Prodi Successfully', result);
  //   }),
  //   postSiswa: promiseHandler(async (req, res, next) => {
  //     const { body } = req;
  //     const newBody = {
  //       ...body,
  //       student_input_date: moment().format('YYYY-MM-DD  HH:mm:ss.000'),
  //       student_last_update: moment().format('YYYY-MM-DD  HH:mm:ss.000'),
  //     };

  //     const result = await siswaModel.postSiswa(newBody);
  //     return helpers.response(res, 200, 'Data Siswa Berhasil Ditambahkan', result);
  //   }),
  putAlumni: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { body } = req;
    console.log(body);
    const newBody = {
      ...body,
      student_last_update: moment().format("YYYY-MM-DD  HH:mm:ss.000"),
    };
    const checkData = await alumniModel.getAlumniById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const result = await alumniModel.putAlumni(id, newBody);
    return helpers.response(res, 200, "Data Siswa Berhasil Diubah", result);
  }),
  //   putStatusSiswa: promiseHandler(async (req, res, next) => {
  //     const { id } = req.params;
  //     const { body } = req;
  //     const newBody = {
  //       ...body,
  //       student_last_update: moment().format('YYYY-MM-DD  HH:mm:ss.000'),
  //     };

  //     const result = await siswaModel.putStatusSiswa(id, newBody);
  //     return helpers.response(res, 200, 'Data Siswa Berhasil Diubah', result);
  //   }),
  //   deleteSiswa: promiseHandler(async (req, res, next) => {
  //     const { id } = req.params;

  //     const checkData = await siswaModel.getSiswaById(id);
  //     if (!checkData) {
  //       return next(customErrorApi(404, 'ID Not Found'));
  //     }
  //     const result = await siswaModel.deletSiswa(id);
  //     return helpers.response(res, 200, 'Data Siswa Berhasil Dihapus', result);
  //   }),
};
