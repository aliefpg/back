const express = require("express");

const Route = express.Router();
const dashboardController = require("../controllers/dashboard");
const { authentication } = require("../middleware/authMiddleware");

Route.get("/", authentication, dashboardController.getDataDashboard);
// .get('/status/:id', kelasController.getKelasByProdi)
//   .post('/', siswaController.postSiswa)
//   .put('/:id', siswaController.putSiswa)
//   .put('/status/:id', siswaController.putStatusSiswa)
//   .delete('/:id', siswaController.deleteSiswa);

module.exports = Route;
