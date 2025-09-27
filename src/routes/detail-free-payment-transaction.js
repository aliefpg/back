const express = require("express");

const Route = express.Router();
const detailFreePaymentTransactionController = require("../controllers/detail-free-payment-transaction");
const { authentication } = require("../middleware/authMiddleware");

Route.get(
  "/payment-transaction/:id",
  detailFreePaymentTransactionController.getAllDetailByPaymentId
).put(
  "/:id",
  authentication,
  detailFreePaymentTransactionController.deleteDetailTransaction
);

module.exports = Route;
