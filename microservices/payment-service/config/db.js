require("dotenv").config();

const mysql = require("mysql2");

console.log("Payment DB Config:", {
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  port: process.env.DB_PORT || process.env.MYSQLPORT,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  database: process.env.PAYMENT_DB_NAME || process.env.DB_NAME || process.env.MYSQLDATABASE
});

const db = mysql.createConnection({
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  port: process.env.DB_PORT || process.env.MYSQLPORT,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.PAYMENT_DB_NAME || process.env.DB_NAME || process.env.MYSQLDATABASE
});

db.connect((err) => {
  if (err) {
    console.log("Koneksi gagal:", err);
  } else {
    console.log("Payment DB terhubung");
  }
});

module.exports = db;