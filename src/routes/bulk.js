const express = require("express");

const Route = express.Router();
const bulkController = require("../controllers/bulk");
const xlsMiddleware = require("../middleware/xlsMiddleware");
const posPayValidator = require("../validator/pos-pay");

Route.post(
  "/siswa",xlsMiddleware,
  bulkController.bulkSiswa
)
  

module.exports = Route;
