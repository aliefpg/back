const helpers = require('../helpers');
const { customErrorApi } = require('../helpers/CustomError');
const { promiseHandler } = require('../middleware/promiseHandler');
const statusSiswaModel = require('../models/status-siswa');

module.exports = {
  getAllStatus: promiseHandler(async (req, res, next) => {
    const result = await statusSiswaModel.getAllStatus();
    return helpers.response(res, 200, 'Get All Status Successfully', result);
  }),
  getStatusById: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await statusSiswaModel.getStatusById(id);
    if (!result) {
      return next(customErrorApi(404, 'ID Not Found'));
    }

    return helpers.response(res, 200, 'Get Status By ID Successfully', result);
  }),

  postStatus: promiseHandler(async (req, res, next) => {
    const { body } = req;

    const result = await statusSiswaModel.postStatus(body);
    return helpers.response(res, 200, 'POST Status Successfully', result);
  }),
  putStatus: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { body } = req;
    const checkData = await statusSiswaModel.getStatusById(id);
    if (!checkData) {
      return next(customErrorApi(404, 'ID Not Found'));
    }
    const result = await statusSiswaModel.putStatus(id, body);
    return helpers.response(res, 200, 'PUT Status Successfully', result);
  }),
  deleteStatus: promiseHandler(async (req, res, next) => {
    const { id } = req.params;

    const checkData = await statusSiswaModel.getStatusById(id);
    if (!checkData) {
      return next(customErrorApi(404, 'ID Not Found'));
    }
    const result = await statusSiswaModel.deleteStatus(id);
    return helpers.response(res, 200, 'DELETE Status Successfully', result);
  }),
};
