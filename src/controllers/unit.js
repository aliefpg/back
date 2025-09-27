/* eslint-disable camelcase */
const helpers = require("../helpers");
const { customErrorApi } = require("../helpers/CustomError");
const { promiseHandler } = require("../middleware/promiseHandler");
const unitModel = require("../models/unit");

module.exports = {
  getAllUnitByUser: promiseHandler(async (req, res, next) => {
    const { token } = req;
    console.log(token.user_id);
    const result = await unitModel.getUnitByUser(token?.user_id);
    return helpers.response(
      res,
      200,
      "Get All Unit By User Successfully",
      result
    );
  }),
  updateUnitByUser: promiseHandler(async (req, res, next) => {
    const { token } = req;
    const { id } = req.params;

    const setData = req.body;
    console.log(setData)
    const unitResult=await unitModel.getUnitById(id);
    delete setData.image;

    if (req.file) {
      if (req.file.filename === "undefined") {
          console.log("gambar undefined")
      }
      else {
        setData.unit_image=req.file.filename;
          try {
              await helpers.deleteImage(unitResult.unit_image)
                  
              } catch (error) {
                  console.log('no image book file')
              }
      }
  }
    const checkData = await unitModel.getUnitByUser(token?.user_id);
    if (!checkData) {
      return next(customErrorApi(404, "Data tidak ditemukan"));
    }
    const result = await unitModel.updateUnit(setData, id);
    return helpers.response(res, 200, "Update Data Unit Berhasil", result);
  }),
};
