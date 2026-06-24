/**
 * Migration: Tambah kolom status_verifikasi dan jenis_jasa ke tabel vendors
 * Jalankan sekali: node migrate_vendor_verification.js
 */

require('dotenv').config();
const db = require('./config/db');

function query(sql) {
    return new Promise((resolve) => {
        db.query(sql, (err, result) => {
            if (err) {
                console.warn('SKIP (mungkin sudah ada):', err.message.substring(0, 80));
            } else {
                console.log('OK:', sql.substring(0, 70));
            }
            resolve(result);
        });
    });
}

async function migrate() {
    // Tambah kolom jenis_jasa
    await query("ALTER TABLE vendors ADD COLUMN jenis_jasa VARCHAR(100) DEFAULT NULL");

    // Tambah kolom status_verifikasi
    await query("ALTER TABLE vendors ADD COLUMN status_verifikasi ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'");

    // Set semua vendor existing ke approved agar tidak hilang dari platform
    await query("UPDATE vendors SET status_verifikasi = 'approved'");

    console.log('\nMigrasi selesai!');
    console.log('- Kolom jenis_jasa ditambahkan (isi manual via database atau saat vendor update profil)');
    console.log('- Kolom status_verifikasi ditambahkan, semua vendor existing = approved');
    process.exit(0);
}

migrate();
