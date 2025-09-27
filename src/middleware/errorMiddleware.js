const helpers = require("../helpers");
const { CustomErrorAPI } = require("../helpers/CustomError");

module.exports = {
  errorMiddleware: async (error, req, res, next) => {
    try {
      if (error instanceof CustomErrorAPI) {
        return helpers.response(res, error.statusCode, error.message);
      }

      console.error("🔥 Internal Error:", error);

      return helpers.response(
        res,
        500,
        `Internal Server Error, ${error.message}`
      );
    } catch (err) {
      console.error("🔥 Error in errorMiddleware:", err);
      return res.status(500).json({ status: 500, message: "Fatal Error" });
    }
  },
};
