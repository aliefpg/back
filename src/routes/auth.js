const express = require("express");
const authController = require("../controllers/auth");
const { authentication } = require("../middleware/authMiddleware");

const Route = express.Router();

Route.post("/login", authController.login);
Route.post("/register", authController.register);
Route.post("/change-password", authentication, authController.changePassword);
Route.post("/me", authentication, authController.checkMe);
Route.post("/logout", authController.logout);

module.exports = Route;
