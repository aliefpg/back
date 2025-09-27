const connection = require("../config/db.config");

module.exports = {
  getAllMonth: () => new Promise((resolve, reject) => {
    connection.query("SELECT * FROM month", (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(error);
      }
    });
  }),

};
