require("dotenv").config();

const mysql = require("mysql2");

console.log("Payment DB Config:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME || process.env.PAYMENT_DB_NAME
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || process.env.PAYMENT_DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log("Koneksi gagal:", err);
  } else {
    console.log("Payment DB terhubung");
  }
});

module.exports = db;