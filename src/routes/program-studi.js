const express = require('express');

const Route = express.Router();
const prodiController = require('../controllers/program-studi');

Route
  .get('/', prodiController.getAllProdi)
  .get('/:id', prodiController.getProdiById)
  .post('/', prodiController.postProdi)
  .put('/:id', prodiController.putProdi)
  .delete('/:id', prodiController.deleteProdi);

module.exports = Route;
