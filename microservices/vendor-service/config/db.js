require("dotenv").config();

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.VENDOR_DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log("Koneksi gagal:", err);
  } else {
    console.log("Vendor DB terhubung");
  }
});

module.exports = db;