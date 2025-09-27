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

    if (!checkData) return next(customErrorApi(401, "Username atau Password Salah"));

    // Compare password async
    const passwordCompare = await bcrypt.compare(user_password, checkData.user_password);
    if (!passwordCompare) return next(customErrorApi(401, "Username atau Password Salah"));

    delete checkData.user_password;
    delete checkData.created_at;
    delete checkData.updated_at;

    // Sign token async
    const token = await new Promise((resolve, reject) => {
      jwt.sign({ ...checkData }, process.env.SECRET_KEY, (err, token) => {
        if (err) reject(err);
        else resolve(token);
      });
    });

    const refreshToken = await new Promise((resolve, reject) => {
      jwt.sign({ ...checkData }, process.env.REFRESH_TOKEN_SECRET_KEY, (err, token) => {
        if (err) reject(err);
        else resolve(token);
      });
    });

    refreshTokens.push(refreshToken);
    const result = { ...checkData, token, refreshToken };
    return helpers.response(res, 200, "Login Berhasil", result);
  }),

  register: promiseHandler(async (req, res, next) => {
    const { user_role_role_id, user_email, user_full_name, user_password } = req.body;

    const checkData = await authModel.getUserByUsername(user_email);
    if (checkData) return next(customErrorApi(401, "Email telah terdaftar"));

    // Hash password async
    const passwordHash = await bcrypt.hash(user_password, 6);

    const htmlTemplate = `<center><h2>Password : </h2><hr><h4>pass : ${user_password}</h4></center>`;
    await helpers.nodemailer(user_email, "Password", htmlTemplate);

    const result = await authModel.register({
      user_role_role_id,
      user_email,
      user_password: passwordHash,
      user_full_name,
    });

    delete result.user_password;
    return helpers.response(res, 200, "Register Berhasil", result);
  }),
};
