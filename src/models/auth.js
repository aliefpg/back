const connection = require("../config/db.config");

module.exports = {
  getUserByUsername: (email) =>
    new Promise((resolve, reject) => {
      connection.query(
        "SELECT users.*, user_roles.role_name FROM users INNER JOIN user_roles ON users.user_role_role_id=user_roles.role_id WHERE user_email = ?",
        [email], // ✅ fix: param harus array
        (error, result) => {
          if (!error) {
            resolve(result[0]);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),

  register: (setData) =>
    new Promise((resolve, reject) => {
      connection.query("INSERT INTO users SET ?", setData, (error, result) => {
        if (!error) {
          const newResult = {
            id: result.insertId,
            ...setData,
          };
          delete newResult.password; // biar password nggak ikut balik
          resolve(newResult);
        } else {
          reject(new Error(error));
        }
      });
    }),

  changePassword: (setData, userId) =>
    new Promise((resolve, reject) => {
      connection.query(
        "UPDATE users SET user_password = ? WHERE user_id = ?",
        [setData, userId], // ✅ sudah benar
        (error, result) => {
          if (!error) {
            const newResult = {
              id: userId,
            };
            delete newResult.password;
            resolve(newResult);
          } else {
            reject(new Error(error));
          }
        }
      );
    }),
};
