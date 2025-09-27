const express = require('express');

const Route = express.Router();
const statusSiswaController = require('../controllers/status-siswa');

Route
  .get('/', statusSiswaController.getAllStatus)
  .get('/:id', statusSiswaController.getStatusById)
  .post('/', statusSiswaController.postStatus)
  .put('/:id', statusSiswaController.putStatus)
  .delete('/:id', statusSiswaController.deleteStatus);

module.exports = Route;
