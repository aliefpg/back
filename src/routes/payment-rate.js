const express = require("express");

const Route = express.Router();
const paymentRateController = require("../controllers/payment-rate");
// const paymentRateValidator = require('../validator/payment-rate');

Route.get("/:id", paymentRateController.getAllPaymentRateByPayment)
  .post("/detail/:id", paymentRateController.getAllDetailPaymentRateById)

  .post("/month/class", paymentRateController.postMonthlyPaymentRateByClass)
  .post("/month/student", paymentRateController.postMonthlyPaymentRateByStudent)
  .post("/free/class", paymentRateController.postFreePaymentRateByClass)
  .post("/free/student", paymentRateController.postFreePaymentRateByStudent)
  .put(
    "/month/student/:id",
    paymentRateController.putMonthlyPaymentRateByStudent
  )
  .put("/month/class/:id", paymentRateController.putMonthlyPaymentRateByClass)
  .put("/free/student/:id", paymentRateController.putFreePaymentRateByStudent)
  .put("/free/class/:id", paymentRateController.putFreePaymentRateByClass)
  // .put('/month/:id', paymentRateController.putPaymentRate)
  .delete("/:id", paymentRateController.deletePaymentRate);

module.exports = Route;
