const helpers = require('../helpers');
const { CustomErrorAPI } = require('../helpers/CustomError');
const connection = require('../config/db.config');

module.exports = {
  errorMiddleware: async (error, req, res, next) => {
    if (error instanceof CustomErrorAPI) {
      await connection.rollback();
      return helpers.response(res, error.statusCode, error.message);
    }
    await connection.rollback();
    console.log(error);
    return helpers.response(res, 500, `Internal Server Error,${error.message}`);
  },
};
