const express = require("express");

const Route = express.Router();
const kreditController = require("../controllers/kredit");
const { authentication } = require("../middleware/authMiddleware");

Route.post("/submitted", authentication, kreditController.postKreditSubmitted)
  .get("/not-submitted", authentication, kreditController.getKreditNotSubmitted)
  .get("/submitted", authentication, kreditController.getAllKreditSubmitted)
  .post(
    "/not-submitted",
    authentication,
    kreditController.postKreditNotSubmitted
  )
  .put("/submitted/:id", authentication, kreditController.putKredit)
  .post("/submitted/", authentication, kreditController.postKreditSubmitted)
  .post("/no-ref", authentication, kreditController.generateNoRef)
  // .get('/status/:id', kelasController.getKelasByProdi)
  //   .post('/', siswaController.postSiswa)
  //   .put('/:id', siswaController.putSiswa)
  //   .put('/status/:id', siswaController.putStatusSiswa)
  .delete("/not-submitted/:id", authentication, kreditController.deleteKredit);

module.exports = Route;
