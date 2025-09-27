// controllers/settingController.js

// Ganti dengan path model Anda yang sesuai
const waConfigModel = require('../models/waConfigModel'); 
const helpers = require("../helpers");

module.exports = {
    // Fungsi untuk handle GET /api/settings/wa-notifications
    getAllWAConfigs: async (req, res) => {
        try {
            const configs = await waConfigModel.getAll(); // Asumsi ada method getAll di model
            return helpers.response(res, 200, "Data Konfigurasi WA berhasil diambil", configs);
        } catch (error) {
            return helpers.response(res, 500, "Terjadi kesalahan server", error);
        }
    },

    // Fungsi untuk handle PUT /api/settings/wa-notifications/{type}
updateWAConfig: async (req, res) => {
    try {
        const { notification_type } = req.params;
        const { template_message, is_active, value } = req.body;

        const updatedData = {
            ...(template_message !== undefined && { template_message }),
            ...(is_active !== undefined && { is_active }),
            ...(value !== undefined && { value }) // Tambahkan ini
        };

        const result = await waConfigModel.update(notification_type, updatedData);
        return helpers.response(res, 200, "Konfigurasi berhasil diperbarui", result);
    } catch (error) {
        return helpers.response(res, 500, "Terjadi kesalahan server", error);
    }
}
};