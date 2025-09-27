const { body } = require('express-validator');

module.exports = [
  body('payment_type', 'Payment Type tidak boleh kosong').not().isEmpty(),
  //   body('sekolah_id', 'Account Type tidak boleh kosong ').not().isEmpty(),
  body('payment_mode', 'Payment Mode tidak boleh kosong ').not().isEmpty(),
  body('period_period_id', 'Period ID  tidak boleh kosong ').not().isEmpty(),
  body('pos_pos_id', 'Pos ID tidak boleh kosong ').not().isEmpty(),
  body('sekolah_id', 'Sekolah ID tidak boleh kosong ').not().isEmpty(),

];
