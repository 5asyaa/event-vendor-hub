/**
 * Jalankan sekali saja untuk sync semua rating_avg vendor dari review_db ke vendor_db.
 * Usage: node backfill-ratings.js
 */
require("dotenv").config();
const db   = require("./config/db");
const http = require("http");

function patchVendorRating(id_vendor, rating_avg) {
  return new Promise((resolve) => {
    const body    = JSON.stringify({ rating_avg });
    const options = {
      hostname: "localhost",
      port:     3002,
      path:     `/vendors/${id_vendor}/rating`,
      method:   "PATCH",
      headers:  { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    };
    const req = http.request(options, (res) => {
      console.log(`  vendor ${id_vendor} → rating_avg = ${rating_avg} (HTTP ${res.statusCode})`);
      resolve();
    });
    req.on("error", e => { console.error(`  vendor ${id_vendor} ERROR: ${e.message}`); resolve(); });
    req.write(body);
    req.end();
  });
}

db.query(
  "SELECT id_vendor, ROUND(AVG(skor_rating), 1) AS avg_rating FROM reviews GROUP BY id_vendor",
  async (err, rows) => {
    if (err) { console.error("Query gagal:", err); process.exit(1); }
    if (!rows.length) { console.log("Tidak ada review di database."); process.exit(0); }

    console.log(`Memperbarui rating untuk ${rows.length} vendor...`);
    for (const row of rows) {
      await patchVendorRating(row.id_vendor, row.avg_rating);
    }
    console.log("Selesai.");
    process.exit(0);
  }
);
