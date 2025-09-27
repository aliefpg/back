// src/middleware/errorMiddleware.js
const helpers = require("../helpers");
const { CustomErrorAPI } = require("../helpers/CustomError");

module.exports = {
  errorMiddleware: (error, req, res, next) => {
    if (error instanceof CustomErrorAPI) {
      return helpers.response(res, error.statusCode, error.message);
    }
    console.error(error);
    return helpers.response(res, 500, `Internal Server Error, ${error.message}`);
  },
};
