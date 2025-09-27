const csvToJson = require("convert-csv-to-json");
const excelToJson = require("convert-excel-to-json");
const moment = require("moment");
const helpers = require("../helpers");
const { customErrorApi } = require("../helpers/CustomError");
const { promiseHandler } = require("../middleware/promiseHandler");
const siswaModel = require("../models/siswa");

module.exports = {
  bulkSiswa: promiseHandler(async (req, res, next) => {
    const { body } = req;

    const result = await excelToJson({
      sourceFile: req.file.path,
      header: {
        rows: 1,
      },
      columnToKey: {
        "*": "{{columnHeader}}", // Map columns to keys based on header names
      },
    });

    // Map the data to an array of arrays
    const values = result.Sheet1?.map((row) => [
      row.student_nis,
      row.student_nisn,
      row.student_password,
      row.student_full_name,
      row.student_gender,
      row.student_born_place,
      row.student_born_date == "-" ? null : row.student_born_date,
      row.student_img,
      row.student_phone,
      row.student_hobby,
      row.student_address,
      row.student_parent_phone,
      row.class_class_id,
      row.majors_majors_id,
      row.student_status,
      row.unit_unit_id,
      moment().format("YYYY-MM-DD  HH:mm:ss.000"),
      moment().format("YYYY-MM-DD  HH:mm:ss.000"),
    ]);
    console.log(result);
    await siswaModel.postSiswaBulk(values);
    return helpers.response(res, 200, "Bulk data Berhasil", result);
  }),
};
