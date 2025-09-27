const { body } = require('express-validator');

module.exports = [
  body('account_code', 'Code tidak boleh kosong').not().isEmpty(),
  body('account_type', 'Account Type tidak boleh kosong ').not().isEmpty(),
  body('account_description', 'Account Desc tidak boleh kosong ').not().isEmpty(),
  body('account_note', 'Account note tidak boleh kosong ').not().isEmpty(),
  // body('account_category', 'Account Category tidak boleh kosong ').not().isEmpty(),
  body('account_majors_id', 'Account Majors tidak boleh kosong ').not().isEmpty(),
];
