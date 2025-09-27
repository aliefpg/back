const express = require('express');

const Route = express.Router();
const paymentTypeController = require('../controllers/payment-type');
const paymentTypeValidator = require('../validator/payment-type');

Route
  .get('/', paymentTypeController.getAllPaymentType)
  .post('/', paymentTypeValidator, paymentTypeController.postPaymentType)
  .put('/:id', paymentTypeController.putPaymentType)
  .delete('/:id', paymentTypeController.deletePaymentType);

module.exports = Route;
