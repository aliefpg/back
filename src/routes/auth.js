const express = require("express");
const authController = require("../controllers/auth");
const {authentication} = require("../middleware/authMiddleware");

const Route = express.Router();

Route.post("/login", authController.login)
  .post("/register", authController.register)
  .post("/change-password",authentication, authController.changePassword)
  .post("/me", authentication,authController.checkMe)
  .post("/logout", authController.logout);

module.exports = Route;
