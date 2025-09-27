const express = require("express");

const Route = express.Router();
const accountCostController = require("../controllers/account-cost");
const accountCostValidator = require("../validator/account-cost");

Route.get("/", accountCostController.getAllAccountCost)
  .get("/pos-pay", accountCostController.getAllAccountCostPay)
  .get("/biaya-masuk", accountCostController.getAllAccountJenisBiayaMasuk)
  .get("/biaya-keluar", accountCostController.getAllAccountJenisBiayaKeluar)
  .get("/aktiva", accountCostController.getAllAktivaAccountCost)
  .post("/code", accountCostController.getGenerateCodeAccountCost)
  .post("/", accountCostValidator, accountCostController.postAccountCost)
  .put("/:id", accountCostController.putAccountCost)
  .delete("/:id", accountCostController.deleteAccountCost);

module.exports = Route;
