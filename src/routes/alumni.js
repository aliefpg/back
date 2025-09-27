const express = require('express');

const Route = express.Router();
const alumniController = require('../controllers/alumni');

Route
  .get('/', alumniController.getAllAlumni)
  .get('/:id', alumniController.getAlumniById)
  .put('/:id', alumniController.putAlumni);
// .get('/status/:id', kelasController.getKelasByProdi)
//   .post('/', siswaController.postSiswa)
//   .put('/:id', siswaController.putSiswa)
//   .put('/status/:id', siswaController.putStatusSiswa)
//   .delete('/:id', siswaController.deleteSiswa);

module.exports = Route;
