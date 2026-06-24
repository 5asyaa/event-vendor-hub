const db   = require("../config/db");
const http = require("http");

// Helper: hitung avg dan update vendor-service via HTTP
function syncRatingToVendor(id_vendor) {
  db.query(
    "SELECT ROUND(AVG(skor_rating), 1) AS avg_rating FROM reviews WHERE id_vendor = ?",
    [id_vendor],
    (err, rows) => {
      if (err || !rows.length) return;
      const avg = rows[0].avg_rating || 0;

      const body    = JSON.stringify({ rating_avg: avg });
      const options = {
        hostname: "localhost",
        port:     3002,
        path:     `/vendors/${id_vendor}/rating`,
        method:   "PATCH",
        headers:  { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
      };
      const req = http.request(options, () => {});
      req.on("error", e => console.error("Gagal sync rating ke vendor-service:", e.message));
      req.write(body);
      req.end();
    }
  );
}

// CREATE REVIEW
exports.createReview = (req, res) => {
  const {
    id_booking,
    id_user,
    id_vendor,
    skor_rating,
    komentar,
    foto_review
  } = req.body;

  // Cegah review duplikat untuk booking yang sama dari user yang sama
  db.query(
    "SELECT id_review FROM reviews WHERE id_booking = ? AND id_user = ?",
    [id_booking, id_user],
    (err, existing) => {
      if (err) return res.status(500).json(err);
      if (existing.length > 0) {
        return res.status(409).json({ message: "Anda sudah memberikan ulasan untuk pesanan ini." });
      }

      db.query(
        `INSERT INTO reviews
        (id_booking, id_user, id_vendor, skor_rating, komentar, foto_review, tanggal_review)
        VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
        [id_booking, id_user, id_vendor, skor_rating, komentar, foto_review],
        (err, result) => {
          if (err) return res.status(500).json(err);

          // Sync rating_avg ke vendor-service (database terpisah)
          syncRatingToVendor(id_vendor);

          res.json({
            message: "Review berhasil ditambahkan",
            id_review: result.insertId
          });
        }
      );
    }
  );
};

// GET ALL REVIEWS
exports.getAll = (req, res) => {
  db.query(
    "SELECT * FROM reviews ORDER BY id_review DESC",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// GET REVIEWS BY VENDOR ID
exports.getByVendor = (req, res) => {
  const id_vendor = req.params.id_vendor;
  db.query(
    "SELECT * FROM reviews WHERE id_vendor = ? ORDER BY id_review DESC",
    [id_vendor],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// GET REVIEW BY BOOKING ID
exports.getByBooking = (req, res) => {
  const id_booking = req.params.id_booking;
  db.query(
    "SELECT * FROM reviews WHERE id_booking = ?",
    [id_booking],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};
