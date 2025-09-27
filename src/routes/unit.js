const express = require("express");
const { authentication } = require("../middleware/authMiddleware");

const Route = express.Router();
const unitController = require("../controllers/unit");
const uploadImage = require("../middleware/imageMiddleware");

Route
  .get("/", authentication, unitController.getAllUnitByUser)
  .put(
    "/:id",
    authentication,
    uploadImage,
    unitController.updateUnitByUser
  );

module.exports = Route;
