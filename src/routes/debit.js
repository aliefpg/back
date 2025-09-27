const express = require("express");

const Route = express.Router();
const debiController = require("../controllers/debit");
const { authentication } = require("../middleware/authMiddleware");

Route.post("/submitted", authentication, debiController.postDebitSubmitted)
  .get("/not-submitted", authentication, debiController.geDebitNotSubmitted)
  .get("/submitted", authentication, debiController.getAllDebitSubmitted)
  .post("/not-submitted", authentication, debiController.postDebitNotSubmitted)
  .put("/submitted/:id", authentication, debiController.putDebit)
  .post("/submitted/", authentication, debiController.postDebitSubmitted)
  .post("/no-ref", authentication, debiController.generateNoRef)
  // .get('/status/:id', kelasController.getKelasByProdi)
  //   .post('/', siswaController.postSiswa)
  //   .put('/:id', siswaController.putSiswa)
  //   .put('/status/:id', siswaController.putStatusSiswa)
  .delete("/not-submitted/:id", authentication, debiController.deleteDebit);

module.exports = Route;
