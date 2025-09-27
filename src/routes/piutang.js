const express = require('express');

const Route = express.Router();
const piutangController = require('../controllers/piutang');
const posPayValidator = require('../validator/pos-pay');

Route
  .get('/', piutangController.getAllPiutang);
// .post('/', posPayValidator, posPayController.postPosPay)
// .put('/:id', posPayController.putPosPay)
// .delete('/:id', posPayController.deletePosPay);

module.exports = Route;
