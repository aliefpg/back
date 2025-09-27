/* eslint-disable consistent-return */
const jwt = require("jsonwebtoken");
const helpers = require("../helpers");

module.exports = {
  authentication: (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.SECRET_KEY, (error, result) => {
        if (
          (error && error.name === "TokenExpiredError")
        || (error && error.name === "JsonWebTokenError")
        ) {
          return helpers.response(res, 401, error.name);
        }

        req.token = result;
        return next();
      });
    } catch (error) {
      console.log(error);
      return helpers.response(res, 401, "Invalid Token");
    }
  },
};
