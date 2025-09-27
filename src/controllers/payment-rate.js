/* eslint-disable max-len */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable camelcase */
const helpers = require("../helpers");
const { promiseHandler } = require("../middleware/promiseHandler");
const paymentRateModel = require("../models/payment-rate");
const studentModel = require("../models/siswa");
const detailPaymentRateModel = require("../models/detail-payment-rate");
const { customErrorApi } = require("../helpers/CustomError");
const { monthArray } = require("../utils/constant");

module.exports = {
  getAllPaymentRateByPayment: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const {
      class_id: class_class_id,
      period,
      unit_unit_id,
      payment_type,
    } = req.query;
    console.log(req.query);
    const period_start = period.split("/")[0] ?? "";
    const period_end = period.split("/")[1] ?? "";
    const unitQuery = `AND unit_unit_id=${unit_unit_id}` ?? "";
    const query = `where (period_start like '%${period_start}%' and period_end like '%${period_end}%') and (class_class_id like '%${class_class_id}%') and payment_payment_id=${id} ${unitQuery}`;

    const result = await paymentRateModel.getAllPaymentRateByPayment(query);
    const resultIds = result.map((item) => item.payment_rate_id).join(",");
    console.log('ini')
    console.log(resultIds)
    const detailQuery = resultIds.length ? ` where payment_rate_id IN(${resultIds})` : '';
    let detailResult;
    if (payment_type == "BULANAN") {
      detailResult =
        await detailPaymentRateModel.getAllDetailMonthlyPaymentRateByFilter(
          detailQuery
        );
    } else {
      detailResult =
        await detailPaymentRateModel.getAllDetailFreePaymentRateByFilter(
          detailQuery
        );
    }
    const newResult = result.map((item) => ({
      ...item,
      nominal: detailResult
        .filter(
          (itemDetail) => itemDetail.payment_rate_id == item.payment_rate_id
        )
        .reduce(
          (accumulator, currentValue) =>
            accumulator + parseInt(currentValue.payment_rate_bill || 0, 10),
          0
        ),
    }));

    return helpers.response(
      res,
      200,
      "get All Payment Rate By Payment Successfully",
      newResult
    );
  }),
  // kerjakan
  getAllDetailPaymentRateById: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const { type = "" } = req.query;
    const { body } = req;

    let newResult = { month: {} };
    if (type.includes("bulanan")) {
      const detailResult =
        await detailPaymentRateModel.getAllDetailMonthlyPaymentRateById(id);
      if (!detailResult) {
        return next(customErrorApi(404, "Data Not Found"));
      }
      const sortedResult = detailResult.sort(
        (a, b) => a.month_month_id - b.month_month_id
      );
      for (let i = 0; i < detailResult.length; i++) {
        newResult.month[`month_${sortedResult[i].month_name.toLowerCase()}`] = {
          id: sortedResult[i].month_month_id,
          payment: sortedResult[i].payment_rate_bill,
        };
        // newResult = {

        //   month: {
        //     ...detailResult.sort((a, b) => a.month_month_id - b.month_month_id).map((item, index) => ({ ...item, [`month_${item.month_name?.toLowerCase()}`]: { id: item.month_month_id, payment: item.payment_rate_bill } })),
        //   },
        // };
      }
      newResult = {
        ...newResult,
        ...body,
      };
    } else if (type.includes("bebas")) {
      const detailResult =
        await detailPaymentRateModel.getAllDetailFreePaymentRateById(id);
      if (!detailResult || detailResult.length < 1) {
        return next(customErrorApi(404, "Data Not Found"));
      }
      console.log(detailResult);
      newResult = {
        ...body,
        ...detailResult[0],
        payment: detailResult[0].payment_rate_bill,
      };
    }

    return helpers.response(
      res,
      200,
      "get Detail Payment Rate By ID Successfully",
      { ...newResult }
    );
  }),
  postMonthlyPaymentRateByClass: promiseHandler(async (req, res, next) => {
    const { class_class_id, payment_payment_id, month, type } = req.body;
    if (type.includes("bulanan")) {
      const queryMonth =
        "INSERT INTO detail_payment_rate_bulan (payment_rate_id,month_month_id,payment_rate_bill) VALUES ?";

      const allStudentByClass = await studentModel.getAllSiswaByClass(
        class_class_id
      );
      let valuesArr = [];

      for (let i = 0; i < allStudentByClass.length; i++) {
        const formDataAddPaymentRate = {
          payment_payment_id,
          student_student_id: allStudentByClass[i].student_id,
        };
        const resultAddData = await paymentRateModel.postPaymentRate(
          formDataAddPaymentRate
        );
        console.log(resultAddData);
        for (const key in month) {
          const values = [
            resultAddData.payment_rate_id,
            month[key].id,
            month[key].payment,
          ];
          valuesArr.push(values);
        }

        await detailPaymentRateModel.postDetailPaymentRate(
          [valuesArr],
          queryMonth
        );
        valuesArr = [];
      }

      // const result = await paymentRateModel.getPaymentRateById(id);
      return helpers.response(
        res,
        200,
        "Tambah Tarif Tagihan bulanan Berhasil",
        allStudentByClass
      );
    }

    return helpers.response(res, 404, "Tambah Tarif Tagihan bulanan Gagal", {});
  }),
  postMonthlyPaymentRateByStudent: promiseHandler(async (req, res, next) => {
    const { payment_payment_id, month, student_student_id, type } = req.body;
    if (type.includes("bulanan")) {
      const queryMonth =
        "INSERT INTO detail_payment_rate_bulan (payment_rate_id,month_month_id,payment_rate_bill) VALUES ?";
      const valuesArr = [];
      const formDataAddPaymentRate = {
        payment_payment_id,
        student_student_id,
      };
      const resultAddData = await paymentRateModel.postPaymentRate(
        formDataAddPaymentRate
      );

      for (const key in month) {
        const values = [
          resultAddData.payment_rate_id,
          month[key].id,
          month[key].payment,
        ];
        valuesArr.push(values);
      }
      await detailPaymentRateModel.postDetailPaymentRate(
        [valuesArr],
        queryMonth
      );

      // const result = await paymentRateModel.getPaymentRateById(id);
      return helpers.response(
        res,
        200,
        "Tambah Tarif Tagihan Berhasil",
        resultAddData
      );
    }

    return helpers.response(res, 404, "Tambah Tarif Tagihan bulanan Gagal", {});
  }),
  postFreePaymentRateByClass: promiseHandler(async (req, res, next) => {
    const { class_class_id, payment_payment_id, payment, type } = req.body;
    console.log(req.body);
    if (type.includes("bebas")) {
      const queryFree =
        "INSERT INTO detail_payment_rate_bebas (payment_rate_id,payment_rate_bill) VALUES ?";

      const allStudentByClass = await studentModel.getAllSiswaByClass(
        class_class_id
      );
      let valuesArr = [];

      for (let i = 0; i < allStudentByClass.length; i++) {
        const formDataAddPaymentRate = {
          payment_payment_id,
          student_student_id: allStudentByClass[i].student_id,
        };
        const resultAddData = await paymentRateModel.postPaymentRate(
          formDataAddPaymentRate
        );
        console.log(resultAddData);

        const values = [resultAddData.payment_rate_id, payment];
        valuesArr.push(values);

        await detailPaymentRateModel.postDetailPaymentRate(
          [valuesArr],
          queryFree
        );
        valuesArr = [];
      }

      // const result = await paymentRateModel.getPaymentRateById(id);
      return helpers.response(
        res,
        200,
        "Tambah Tarif Tagihan Bebas Berhasil",
        allStudentByClass
      );
    }

    return helpers.response(res, 404, "Tambah Tarif Tagihan Bebas Gagal", {});
  }),
  postFreePaymentRateByStudent: promiseHandler(async (req, res, next) => {
    const { student_student_id, payment_payment_id, payment, type } = req.body;
    console.log(req.body);
    if (type.includes("bebas")) {
      const queryFree =
        "INSERT INTO detail_payment_rate_bebas (payment_rate_id,payment_rate_bill) VALUES ?";
      const valuesArr = [];

      const formDataAddPaymentRate = {
        payment_payment_id,
        student_student_id,
      };
      const resultAddData = await paymentRateModel.postPaymentRate(
        formDataAddPaymentRate
      );
      const values = [resultAddData.payment_rate_id, payment];
      valuesArr.push(values);

      await detailPaymentRateModel.postDetailPaymentRate(
        [valuesArr],
        queryFree
      );

      // const result = await paymentRateModel.getPaymentRateById(id);
      return helpers.response(
        res,
        200,
        "Tambah Tarif Tagihan Bebas Berhasil",
        resultAddData
      );
    }

    return helpers.response(res, 404, "Tambah Tarif Tagihan Bebas Gagal", {});
  }),
  putMonthlyPaymentRateByStudent: promiseHandler(async (req, res, next) => {
    const { payment_rate_id, month, student_student_id } = req.body;
    console.log(req.body);

    for (const key in month) {
      const queryMonth = `UPDATE detail_payment_rate_bulan SET payment_rate_bill=${month[key].payment} where month_month_id=${month[key].id} AND payment_rate_id=${payment_rate_id}`;
      await detailPaymentRateModel.putDetailPaymentRateByStudent(
        { ...req.body },
        queryMonth
      );
    }

    // const result = await paymentRateModel.getPaymentRateById(id);
    return helpers.response(res, 200, "Ubah Tarif Tagihan Berhasil", {
      ...req.body,
    });
  }, true),
  putMonthlyPaymentRateByClass: promiseHandler(async (req, res, next) => {
    const { payment_payment_id, month, payment_new, payment_old } = req.body;
    const { id } = req.params;
    const filter = `payment_payment_id=${payment_payment_id} AND class_class_id=${id}`;
    const getPaymentRateId = await paymentRateModel.getPaymentRateByQuery(
      filter
    );
    if (getPaymentRateId.length < 1) {
      return next(customErrorApi(404, "Data Tidak Ditemukan"));
    }
    const monthObj = JSON.parse(month);
    let monthArr = [];
    for (let key in monthObj.month_change) {
      monthArr.push(monthObj.month_change[key]);
    }
    const monthString = monthArr.join(",");
    const paymentRateId = getPaymentRateId
      .map((item) => item.payment_rate_id)
      .join(",");
    const detailFilter = `where payment_rate_id IN (${paymentRateId}) AND payment_rate_bill=${payment_old} AND month_month_id IN (${monthString})`;

    const getDetailPayments =
      await detailPaymentRateModel.getAllDetailMonthlyPaymentRateByFilter(
        detailFilter
      );
    if (getDetailPayments.length < 1) {
      return next(customErrorApi(404, "Data Tidak Ditemukan"));
    }
    const detailIdArr = getDetailPayments
      .map((item) => item.detail_payment_rate_id)
      .join(",");

    await detailPaymentRateModel.putMonthlyDetailPaymentRateByClass(
      payment_new,
      detailIdArr
    );

    // const result = await paymentRateModel.getPaymentRateById(id);
    return helpers.response(res, 200, "Ubah Tarif Tagihan Berhasil", {
      ...req.body,
    });
  }, true),
  putFreePaymentRateByClass: promiseHandler(async (req, res, next) => {
    const { payment_payment_id, payment_new, payment_old } = req.body;
    const { id } = req.params;
    const filter = `payment_payment_id=${payment_payment_id} AND class_class_id=${id}`;
    const getPaymentRateId = await paymentRateModel.getPaymentRateByQuery(
      filter
    );
    if (getPaymentRateId.length < 1) {
      return next(customErrorApi(404, "Data Tidak Ditemukan"));
    }

    const paymentRateId = getPaymentRateId
      .map((item) => item.payment_rate_id)
      .join(",");

    const detailFilter = `where payment_rate_id IN (${paymentRateId}) AND payment_rate_bill=${payment_old}`;
    const getDetailPayments =
      await detailPaymentRateModel.getAllDetailFreePaymentRateByFilter(
        detailFilter
      );
    console.log(detailFilter);

    if (getDetailPayments.length < 1) {
      return next(customErrorApi(404, "Data Tidak Ditemukan"));
    }
    const detailIdArr = getDetailPayments
      .map((item) => item.detail_payment_rate_id)
      .join(",");

    await detailPaymentRateModel.putFreeDetailPaymentRateByClass(
      payment_new,
      detailIdArr
    );

    // const result = await paymentRateModel.getPaymentRateById(id);
    return helpers.response(res, 200, "Ubah Tarif Tagihan Berhasil", {
      ...req.body,
    });
  }, true),
  putFreePaymentRateByStudent: promiseHandler(async (req, res, next) => {
    const { payment_rate_id, payment } = req.body;
    console.log(req.body);

    const queryFree = `UPDATE detail_payment_rate_bebas SET payment_rate_bill='${payment}' where payment_rate_id='${payment_rate_id}'`;
    const result = await detailPaymentRateModel.putDetailPaymentRateByStudent(
      { ...req.body },
      queryFree
    );
    console.log(result);
    return helpers.response(res, 200, "Ubah Tarif Tagihan Berhasil", {
      ...req.body,
    });
  }, true),
  deletePaymentRate: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    console.log(id);

    const checkData = await paymentRateModel.getPaymentRateById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const result = await paymentRateModel.deletePaymentRate(id);
    return helpers.response(
      res,
      200,
      "Data Tarif Tagihan Berhasil Dihapus",
      result
    );
  }),
};
