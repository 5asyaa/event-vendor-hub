require("dotenv").config();

const mysql = require("mysql2");

// Gunakan createPool agar koneksi otomatis dibuat ulang jika terputus (idle timeout)
const db = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  port: process.env.DB_PORT || process.env.MYSQLPORT,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.VENDOR_DB_NAME || process.env.DB_NAME || process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("Vendor DB koneksi gagal:", err.message);
  } else {
    console.log("Vendor DB terhubung (pool)");
    connection.release();
  }
});

module.exports = db;