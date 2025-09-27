/* eslint-disable camelcase */
const generatorPassword = require("generate-password");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helpers = require("../helpers");
const { customErrorApi } = require("../helpers/CustomError");
const { promiseHandler } = require("../middleware/promiseHandler");
const authModel = require("../models/auth");

const refreshTokens = [];

module.exports = {
  login: promiseHandler(async (req, res, next) => {
    const { user_email, user_password } = req.body;
    const checkData = await authModel.getUserByUsername(user_email);
    console.log("login");
    if (!checkData) {
      return next(customErrorApi(401, "Username atau Password Salah"));
    }
    const passwordCompare = bcrypt.compareSync(
      user_password,
      checkData.user_password
    );
    if (!passwordCompare) {
      return next(customErrorApi(401, "Username atau Password Salah"));
    }
    delete checkData.user_password;
    delete checkData.created_at;
    delete checkData.updated_at;
    // checkData.user_id;
    const token = jwt.sign({ ...checkData }, process.env.SECRET_KEY);
    console.log(checkData);
    const refreshToken = jwt.sign(
      { checkData },
      process.env.REFRESH_TOKEN_SECRET_KEY
    );
    refreshTokens.push(refreshToken);
    const result = {
      ...checkData,
      token,
      refreshToken,
    };
    console.log(result);
    return helpers.response(res, 200, "Login Berhasil", result);
  }),
  checkMe: promiseHandler(async (req, res, next) => {
    const { token } = req.body;
    console.log("fffff", req.body.token);
    const resultToken = jwt.verify(token, process.env.SECRET_KEY);
    console.log(resultToken);
    const result = await authModel.getUserByUsername(resultToken.user_email);
    if (!result) {
      return next(customErrorApi(404, "Data tidak ditemukan"));
    }
    delete result.user_password;
    delete result.created_at;
    delete result.updated_at;

    return helpers.response(res, 200, "Get Data User Berhasil", {
      ...result,
      token,
    });
  }),
  register: promiseHandler(async (req, res, next) => {
    const {
      user_role_role_id, user_email, user_full_name, user_password
    } = req.body;

    const checkData = await authModel.getUserByUsername(user_email);
    if (checkData) {
      return next(customErrorApi(401, "Email telah terdaftar"));
    }
    // const password = generatorPassword.generate({ length: 10, numbers: true });

    const passwordHash = bcrypt.hashSync(user_password, 6);
    const htmlTemplate = `<center><h2>Password : </h2><hr><h4>pass : ${user_password}</h4></center>`;
    const emailSending = await helpers.nodemailer(
      user_email,
      "Password",
      htmlTemplate
    );

    const result = await authModel.register({
      user_role_role_id,
      user_email,
      user_password: passwordHash,
      user_full_name,
    });

    const newResult = {
      ...result,
    };
    delete newResult.password;

    return helpers.response(res, 200, "Register Berhasil", result);
  }),
  changePassword: promiseHandler(async (req, res, next) => {
    const {
      password
    } = req.body;
    const { user_email, user_id } = req.token;

    const checkData = await authModel.getUserByUsername(user_email);
    if (!checkData) {
      return next(customErrorApi(401, "Akun tidak terdaftar"));
    }
    // const password = generatorPassword.generate({ length: 10, numbers: true });

    const passwordHash = bcrypt.hashSync(password, 6);

    const result = await authModel.changePassword(passwordHash, user_id);

    const newResult = {
      ...result,
    };
    delete newResult.password;

    return helpers.response(res, 200, "Ubah Password Berhasil", result);
  }),
  logout: promiseHandler(async (req, res, next) => {
    console.log(refreshTokens);
    const { token } = req.body;
    const findIndex = refreshTokens.findIndex((item) => item == token);
    if (findIndex == -1) {
      return helpers.response(res, 200, "Logout Berhasil", {});
    }

    refreshTokens.splice(findIndex, 1);
    console.log(refreshTokens);
    return helpers.response(res, 200, "Logout Berhasil", {});
  }),
};
