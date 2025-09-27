const express = require("express");

const Route = express.Router();
const cashAccountController = require("../controllers/cash-account");

Route.get("/", cashAccountController.getAllCashAccount).put(
  "/:id",
  cashAccountController.putCashAccount
);

module.exports = Route;
