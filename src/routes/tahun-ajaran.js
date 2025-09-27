const express = require('express');

const Route = express.Router();
const tahunAjaranController = require('../controllers/tahun-ajaran');

Route
  .get('/', tahunAjaranController.getAllTahunAjaran)
  .get('/:id', tahunAjaranController.getTahunAjaranById)
  .post('/', tahunAjaranController.postTahunAjaran)
  .put('/:id', tahunAjaranController.putStatusTahunAjaran)
  .put('/status/:id', tahunAjaranController.putStatusTahunAjaran)
  .delete('/:id', tahunAjaranController.deleteTahunAjaran);

module.exports = Route;
