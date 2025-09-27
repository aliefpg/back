const { body } = require("express-validator");

module.exports = [
  // body('account_account_code', 'Account Code tidak boleh kosong').not().isEmpty(),
  // body('sekolah_id', 'Account Type tidak boleh kosong ').not().isEmpty(),
  body("account_account_credit", "Account Credit tidak boleh kosong ")
    .not()
    .isEmpty(),
  body("pos_pay_name", "Pos Pay Name tidak boleh kosong ").not().isEmpty(),
  body("pos_pay_description", "Pos Pay Description tidak boleh kosong ")
    .not()
    .isEmpty(),
];
