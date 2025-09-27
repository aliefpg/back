const helpers = require("../helpers");
const { promiseHandler } = require("../middleware/promiseHandler");
const detailFreePaymentModel = require("../models/detail-free-payment-transaction");
const freePaymentModel = require("../models/free-payment");
const studentModel = require("../models/siswa");
module.exports = {
  getAllDetailByPaymentId: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const data = await freePaymentModel.getFreePaymentById(id);
    const result = await detailFreePaymentModel.getAllDetailByPaymentId(id);
    console.log(data);
    console.log("data loh");
    const newResult = {
      total_pembayaran: parseInt(data.payment_rate_total_pay, 10) ?? 0,
      sisa_pembayaran: parseInt(
        data.payment_rate_bill -
          data.payment_rate_discount -
          data.payment_rate_total_pay,
        10
      ),
      pembayaran_detail: [...result],
    };
    return helpers.response(
      res,
      200,
      "GET Data Detail Pembayaran Bebas Bearhasil",
      newResult
    );
  }),
  deleteDetailTransaction: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { token } = req;
    const { student_student_id, detail_payment_rate_id } = req.body;

    console.log(req.body);
    await detailFreePaymentModel.deleteDetailTransaction(id);
    //dapatkan data detail pembayaran terbaru
    const resultDetail =
      await freePaymentModel.getDetailFreePaymentTypeByIdPayment(
        detail_payment_rate_id
      );
    const total = resultDetail.reduce(
      (accumulator, currentValue) =>
        accumulator + parseInt(currentValue.payment_rate_bebas_pay_bill, 10),
      0
    );
    const dataFreePaymentById = await freePaymentModel.getFreePaymentById(
      detail_payment_rate_id
    );

    const formBodyPayment = {
      payment_rate_total_pay: total,
      payment_rate_status:
        dataFreePaymentById.payment_rate_bill -
          dataFreePaymentById.payment_rate_discount -
          total ==
        0
          ? 1
          : 0,
    };
    const resultSiswa = await studentModel.getSiswaById(student_student_id);
    const result = await freePaymentModel.putPaymentFreePayment(
      formBodyPayment,
      detail_payment_rate_id
    );
    const setDataLog = {
      description: `${token.user_full_name} menghapus detail pembayaran bebas siswa ${resultSiswa.student_full_name}`,
      user_user_id: token.user_id ?? null,
    };
    return helpers.response(
      res,
      200,
      "Hapus Detail Pembayaran Bearhasil",
      result
    );
  }),
};
