const moment = require("moment");
const helpers = require("../helpers");
const { customErrorApi } = require("../helpers/CustomError");
const { promiseHandler } = require("../middleware/promiseHandler");
const kreditModel = require("../models/kredit");
const logModel = require("../models/log");

module.exports = {
  getAllKreditSubmitted: promiseHandler(async (req, res, next) => {
    const { unit_unit_id } = req.query || "";

    const result = await kreditModel.getAllKreditSubmitted(unit_unit_id);
    return helpers.response(res, 200, "Get All Kredit Successfully", result);
  }),
  getKelasById: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await kelasModel.getKelasById(id);
    if (!result) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    return helpers.response(res, 200, "Get Kredit By ID Successfully", result);
  }),
  getKelasByProdi: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await kelasModel.getKelasByProdi(id);
    if (!result) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    return helpers.response(
      res,
      200,
      "Get Kelas By Prodi Successfully",
      result
    );
  }),
  getKreditNotSubmitted: promiseHandler(async (req, res, next) => {
    const { unit_id, no_ref } = req.query;
    const result = await kreditModel.getAllKreditNoSubmittedByRef(
      unit_id,
      no_ref
    );
    if (!result) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    const newArr = [
      ...result.map((item) => ({
        ...item,
        total:
          parseFloat(
            (parseFloat(item.kredit_tax, 10) / 100) * item.kredit_value
          ) + parseFloat(item.kredit_value, 10),
      })),
    ];
    const newResult = {
      result: [...newArr],
      total: newArr.reduce(
        (accumulator, currentValue) =>
          accumulator + parseFloat(currentValue.total, 10),
        0
      ),
      total_tax: newArr.reduce(
        (accumulator, currentValue) =>
          accumulator + parseFloat(currentValue.kredit_tax, 10),
        0
      ),
      total_value: newArr.reduce(
        (accumulator, currentValue) =>
          accumulator + parseFloat(currentValue.kredit_value, 10),
        0
      ),
    };

    return helpers.response(
      res,
      200,
      "Get Kredit Not Submitted Successfully",
      newResult
    );
  }),
  postKreditNotSubmitted: promiseHandler(async (req, res, next) => {
    const {
      kredit_date,
      kredit_no_ref,
      kredit_desc,
      kredit_value,
      account_cash_account,
      account_cost_account,
      kredit_tax,
      kredit_information,
      unit_unit_id,
    } = req.body;

    const { token } = req;

    const formBody = {
      kredit_date: moment(kredit_date).format('YYYY-MM-DD HH:MM:SS'),

      kredit_no_ref,
      kredit_desc,
      kredit_value,
      kredit_total: parseInt(kredit_value, 10) + ((parseInt(kredit_value, 10) * parseInt(kredit_tax, 10) / 100)),

      account_cash_account,
      account_cost_account,
      kredit_tax,
      kredit_information,
      unit_unit_id,
      is_submit: 0,
      user_user_id: token.user_id ?? null,
    };

    const result = await kreditModel.postKredit(formBody);

    const setDataLog = {
      description: `${token.user_full_name} Menambah draft Kas Keluar dengan ID ${result.insertId}`,
      user_user_id: token.user_id ?? null,
    };
    console.log(token);
    await logModel.postLog(setDataLog);
    return helpers.response(
      res,
      200,
      "Data Kredit Berhasil Ditambahkan",
      result
    );
  }, true),
  postKreditSubmitted: promiseHandler(async (req, res, next) => {
    const { kredit_ids } = req.body;
    const { token } = req;
    const formBody = {
      is_submit: 1,
    };

    const result = await kreditModel.putKreditsByMoreId(
      kredit_ids.join(","),
      formBody
    );
    const setDataLog = {
      description: `${token.user_full_name
        } Melakukan Submit Kas Keluar dengan ID ${kredit_ids.join(",")}`,
      user_user_id: token.user_id ?? null,
    };
    console.log(token);
    await logModel.postLog(setDataLog);
    return helpers.response(
      res,
      200,
      "Data Kredit Berhasil Ditambahkan",
      result
    );
  }, true),
  cancelKreditNotSubmitted: promiseHandler(async (req, res, next) => {
    const { kredit_ids } = req.body;

    const { token } = req;

    const formBody = {
      is_submit: 1,
    };

    const result = await kreditModel.postKredit(formBody);
    return helpers.response(
      res,
      200,
      "Data Kredit Berhasil Ditambahkan",
      result
    );
  }),
  generateNoRef: promiseHandler(async (req, res, next) => {
    const { unit_name } = req.body;
    let code = `JK${unit_name}${moment().format("DDMMYY")}00`;
    const checkData = await kreditModel.getKreditByNoRef(code);
    const lastArr = checkData[0]?.kredit_no_ref
      .substring(checkData[0].kredit_no_ref.length - 2)
      .split("");
    const newDigit = lastArr
      ? `${lastArr[0]}${parseInt(lastArr[1]) + 1}`
      : "01";

    code += newDigit;
    return helpers.response(res, 200, "Data Kredit Berhasil Diubah", {
      no_ref: code,
    });
  }),
  putKredit: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    const {
      kredit_date,
      kredit_no_ref,
      kredit_desc,
      kredit_value,
      account_cash_account,
      account_cost_account,
      kredit_tax,
      kredit_information,
      unit_unit_id,
    } = req.body;

    const { token } = req;

    const formBody = {
      kredit_date,
      kredit_no_ref,
      kredit_desc,
      kredit_value,
      account_cash_account,
      account_cost_account,
      kredit_tax,
      kredit_information,
      unit_unit_id,
    };

    const checkData = await kreditModel.getKreditById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }

    const result = await kreditModel.putKredit(id, formBody);

    const setDataLog = {
      description: `${token.user_full_name} Melakukan Ubah Kas Keluar dengan ID ${id}`,
      user_user_id: token.user_id ?? null,
    };
    return helpers.response(res, 200, "Data Kredit Berhasil Diubah", result);
  }, true),
  deleteKredit: promiseHandler(async (req, res, next) => {
    const { id } = req.params;
    console.log(id);
    const checkData = await kreditModel.getKreditById(id);
    if (!checkData) {
      return next(customErrorApi(404, "ID Not Found"));
    }
    const result = await kreditModel.deleteKredit(id);
    return helpers.response(res, 200, "Data Kredit Berhasil Dihapus", result);
  }),
};
