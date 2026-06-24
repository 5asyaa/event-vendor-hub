const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'booking_db'
});

db.connect((err) => {
  if (err) {
    console.error("Connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to booking_db");
  
  db.query("SHOW TABLES", (err, tables) => {
    if (err) {
      console.error("SHOW TABLES failed:", err);
      db.end();
      return;
    }
    console.log("Tables in booking_db:", tables);
    
    db.query("DESCRIBE bookings", (err, cols) => {
      if (err) {
        console.error("DESCRIBE bookings failed:", err);
      } else {
        console.log("Columns in bookings:", cols);
      }
      db.end();
    });
  });
});
