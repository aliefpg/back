const express = require('express');

const Route = express.Router();
const posPayController = require('../controllers/pos-pay');
const posPayValidator = require('../validator/pos-pay');

Route
  .get('/', posPayController.getAllPosPay)
  .post('/', posPayValidator, posPayController.postPosPay)
  .put('/:id', posPayController.putPosPay)
  .delete('/:id', posPayController.deletePosPay);

module.exports = Route;
