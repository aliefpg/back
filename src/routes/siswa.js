const express = require('express');

const Route = express.Router();
const siswaController = require('../controllers/siswa');

Route
  .get('/', siswaController.getAllSiswa)
  .get('/:id', siswaController.getSiswaById)
  // .get('/status/:id', kelasController.getKelasByProdi)
  .post('/', siswaController.postSiswa)
  .put('/:id', siswaController.putSiswa)
  .put('/status/:id', siswaController.putStatusSiswa)
  .put('/kenaikan-kelas/bulk', siswaController.putKenaikanKelasSiswaByIds)
  .delete('/:id', siswaController.deleteSiswa);

module.exports = Route;
