const express = require('express');

const Route = express.Router();
const kelasController = require('../controllers/kelas');

Route
  .get('/', kelasController.getAllKelas)
  .get('/:id', kelasController.getKelasById)
  .get('/program-studi/:id', kelasController.getKelasByProdi)
  .post('/', kelasController.postKelas)
  .put('/:id', kelasController.putKelas)
  .delete('/:id', kelasController.deleteKelas);

module.exports = Route;
