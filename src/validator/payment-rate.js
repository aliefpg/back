const { body } = require('express-validator');

module.exports = [
  body('payment_id', 'Payment ID tidak boleh kosong').not().isEmpty(),
  body('class_id', 'Class ID tidak boleh kosong ').not().isEmpty(),
  body('student_id', 'Account Desc tidak boleh kosong ').not().isEmpty(),

];
