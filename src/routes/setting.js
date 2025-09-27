// routes/settings.js

const express = require('express');
const router = express.Router();

// Import controller yang sesuai
const settingController = require('../controllers/settingController');

// Definisikan rute yang akan di-mount di /settings
// URL lengkapnya akan menjadi -> /settings/wa-notifications
router.get('/wa-notifications', settingController.getAllWAConfigs);
router.put('/wa-notifications/:notification_type', settingController.updateWAConfig);

module.exports = router;