const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'auth_db'
});

db.connect((err) => {
  if (err) {
    console.error("Connection to database failed:", err);
    process.exit(1);
  }
  console.log("Connected to auth_db for password migration");

  db.query("SELECT id_user, nama, email, password FROM users", async (err, users) => {
    if (err) {
      console.error("Failed to query users:", err);
      db.end();
      return;
    }

    console.log(`Found ${users.length} users in the database.`);
    let migratedCount = 0;

    for (const user of users) {
      const password = user.password;
      
      // Bcrypt hash regex check (usually starts with $2a$, $2b$, or $2y$, followed by salt and digest, 60 characters)
      const isAlreadyHashed = typeof password === 'string' && password.startsWith('$2a$') && password.length === 60;

      if (!isAlreadyHashed) {
        try {
          const salt = bcrypt.genSaltSync(10);
          const hashedPassword = bcrypt.hashSync(password, salt);
          
          await new Promise((resolve, reject) => {
            db.query(
              "UPDATE users SET password = ? WHERE id_user = ?",
              [hashedPassword, user.id_user],
              (updateErr) => {
                if (updateErr) reject(updateErr);
                else resolve();
              }
            );
          });
          
          console.log(`Migrated password for user: ${user.email}`);
          migratedCount++;
        } catch (error) {
          console.error(`Failed to migrate password for user ${user.email}:`, error);
        }
      } else {
        console.log(`User ${user.email} already has a hashed password.`);
      }
    }

    console.log(`Migration finished. Successfully migrated ${migratedCount} passwords.`);
    db.end();
  });
});
