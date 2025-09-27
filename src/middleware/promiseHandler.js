const connection = require("../config/db.config");

const promiseHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (!res.headersSent) {
        next(error); // kirim error ke middleware handler kalau response belum dikirim
      } else {
        console.error("Error terjadi setelah response terkirim:", error);
      }
    }
  };
};

module.exports = { promiseHandler };
