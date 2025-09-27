const nodemailer = require("nodemailer");
const mysqldump = require("mysqldump");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
require("dotenv").config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
};

module.exports = {
  response: (response, status, message, data = {}) => {
    const result = {
      status: status || 200,
      message,
      data,
    };
    return response.status(result.status).json(result);
  },

  async nodemailer(email, subject, template) {
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE_MAILER,
      auth: {
        user: process.env.SERVICE_EMAIL,
        pass: process.env.SERVICE_EMAIL_GENERATE_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SERVICE_EMAIL,
      to: email,
      subject,
      html: template,
    };

    try {
      // Gunakan await untuk mengirim email dan menunggu hasilnya
      const info = await transporter.sendMail(mailOptions);
      console.log(`email sent ${info.response}`);
      return true;
    } catch (error) {
      console.error("Gagal mengirim email:", error);
      return false;
    }
},

  queryToString: (query) => {
    let result = "";
    for (const key in query) {
      if (query[key] == undefined || query[key] === "") {
        continue;
      }
      result += `${key} LIKE'${query[key] || ""}' AND `;
    }
    const filter = result.replace(/AND\s$/g, "");
    return filter;
  },

  dateConvert: (data) => {
    const date = new Date(data);
    return `${date.getDate()} ${date.toLocaleString("id", {
      month: "long",
    })} ${date.getFullYear()}`;
  },

  convertTimestampToMySQLDate: (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = `0${date.getUTCMonth() + 1}`.slice(-2);
    const day = `0${date.getUTCDate()}`.slice(-2);
    return `${year}-${month}-${day} `;
  },

  formatDate: (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  },

  // VERSI PERBAIKAN
rupiahConvert: (data) => {
    const num = Number(data);
    if (data === null || isNaN(num)) {
      return "Rp 0"; // Kembalikan nilai default yang aman
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
},

  terbilang_rupiah(nilai) {
    nilai = Math.floor(Math.abs(nilai));
    const huruf = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let temp = "";

    if (nilai < 12) {
      temp = ` ${huruf[nilai]}`;
    } else if (nilai < 20) {
      temp = `${this.terbilang_rupiah(nilai - 10)} Belas`;
    } else if (nilai < 100) {
      temp = `${this.terbilang_rupiah(Math.floor(nilai / 10))} Puluh${this.terbilang_rupiah(nilai % 10)}`;
    } else if (nilai < 200) {
      temp = ` Seratus${this.terbilang_rupiah(nilai - 100)}`;
    } else if (nilai < 1000) {
      temp = `${this.terbilang_rupiah(Math.floor(nilai / 100))} Ratus${this.terbilang_rupiah(nilai % 100)}`;
    } else if (nilai < 2000) {
      temp = ` Seribu${this.terbilang_rupiah(nilai - 1000)}`;
    } else if (nilai < 1000000) {
      temp = `${this.terbilang_rupiah(Math.floor(nilai / 1000))} Ribu${this.terbilang_rupiah(nilai % 1000)}`;
    } else if (nilai < 1000000000) {
      temp = `${this.terbilang_rupiah(Math.floor(nilai / 1000000))} Juta${this.terbilang_rupiah(nilai % 1000000)}`;
    } else if (nilai < 1000000000000) {
      temp = `${this.terbilang_rupiah(Math.floor(nilai / 1000000000))} Miliar${this.terbilang_rupiah(nilai % 1000000000)}`;
    } else if (nilai < 1000000000000000) {
      temp = `${this.terbilang_rupiah(Math.floor(nilai / 1000000000000))} Triliun${this.terbilang_rupiah(nilai % 1000000000000)}`;
    }

    return temp.trim();
},

  extractUniqueAccountCodes: (data) => {
    const uniqueAccountCodes = new Set();
    data.data_payment.forEach((item) => {
      uniqueAccountCodes.add(item.account_code);
    });
    return Array.from(uniqueAccountCodes);
  },

  generateDumpSQL: async () => {
    try {
      const dump = await mysqldump({
        connection: dbConfig,
        dumpToFile: "./backup_db.sql",
      });
      return dump;
    } catch (error) {
      console.error("Error creating dump:", error);
      return null;
    }
  },

  deleteImage(image) {
    return new Promise((resolve, reject) => {
      fs.unlink(`./public/image/${image}`, (err) => {
        if (err) return reject(new Error(err));
        resolve(console.log("File delete succesfully"));
      });
    });
  },

  delay(time) {
    return new Promise((resolve, reject) => setTimeout(resolve, time));
  },
};
