const db = require("../config/db.config");

module.exports = {
  getUserByUsername: async (email) => {
    const [rows] = await db.query(
      "SELECT users.*, user_roles.role_name FROM users INNER JOIN user_roles ON users.user_role_role_id=user_roles.role_id WHERE user_email = ?",
      [email]
    );
    return rows[0];
  },

  register: async (setData) => {
    const [result] = await db.query("INSERT INTO users SET ?", setData);
    const newResult = { id: result.insertId, ...setData };
    delete newResult.password;
    return newResult;
  },

  changePassword: async (password, userId) => {
    await db.query("UPDATE users SET user_password = ? WHERE user_id = ?", [
      password,
      userId,
    ]);
    return { id: userId };
  },
};
