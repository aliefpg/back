const express = require('express');

const Route = express.Router();
const dbBackupController = require('../controllers/db-backup');

Route
  .get('/', dbBackupController.generateDBBackup)
// .get('/status/:id', kelasController.getKelasByProdi)
//   .post('/', siswaController.postSiswa)
//   .put('/:id', siswaController.putSiswa)
//   .put('/status/:id', siswaController.putStatusSiswa)
//   .delete('/:id', siswaController.deleteSiswa);

module.exports = Route;
